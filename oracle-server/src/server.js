import http from "node:http";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

import {
  buildMockPremiumRiskScore,
  buildPaymentRequired,
  buildSettlementResponse,
  decodeBase64Json,
  encodeBase64Json,
  isWellFormedPaymentPayload,
} from "./x402.js";

function jsonResponse(response, statusCode, body, headers = {}) {
  response.writeHead(statusCode, {
    "content-type": "application/json",
    ...headers,
  });
  response.end(JSON.stringify(body));
}

function resourceUrl(request, options) {
  const host = request.headers.host ?? `127.0.0.1:${options.port ?? 3002}`;
  const protocol = options.publicBaseUrl?.startsWith("https://") ? "https" : "http";
  return options.publicBaseUrl
    ? `${options.publicBaseUrl}${request.url}`
    : `${protocol}://${host}${request.url}`;
}

async function verifyWithFacilitator(paymentPayload, paymentRequirements, options) {
  if (options.mode !== "live") {
    return { isValid: isWellFormedPaymentPayload(paymentPayload, paymentRequirements), payer: "mock-payer" };
  }
  if (!options.facilitatorToken) {
    return {
      isValid: false,
      invalidReason: "missing_facilitator_token",
      invalidMessage: "CSPR_CLOUD_ACCESS_TOKEN is required for live facilitator verification",
    };
  }

  const response = await fetch(`${options.facilitatorUrl ?? "https://x402-facilitator.cspr.cloud"}/verify`, {
    method: "POST",
    headers: {
      accept: "application/json",
      authorization: options.facilitatorToken,
      "content-type": "application/json",
    },
    body: JSON.stringify({ paymentPayload, paymentRequirements }),
  });
  return response.json();
}

async function settleWithFacilitator(paymentPayload, paymentRequirements, options) {
  if (options.mode !== "live") {
    return buildSettlementResponse(
      paymentPayload.resource?.url?.split("/").at(-1) ?? "unknown",
      paymentPayload.payload?.authorization?.from ?? "mock-payer",
    );
  }

  const response = await fetch(`${options.facilitatorUrl ?? "https://x402-facilitator.cspr.cloud"}/settle`, {
    method: "POST",
    headers: {
      accept: "application/json",
      authorization: options.facilitatorToken,
      "content-type": "application/json",
    },
    body: JSON.stringify({ paymentPayload, paymentRequirements }),
  });
  return response.json();
}

export function createOracleServer(options = {}) {
  const mode = options.mode ?? process.env.X402_SERVER_MODE ?? "mock";
  const serverOptions = {
    ...options,
    mode,
    facilitatorToken: options.facilitatorToken ?? process.env.CSPR_CLOUD_ACCESS_TOKEN,
  };

  return http.createServer(async (request, response) => {
    try {
      const match = request.url?.match(/^\/api\/v1\/rwa-risk-score\/([^/?#]+)/);
      if (request.method !== "GET" || !match) {
        jsonResponse(response, 404, { error: "not_found" });
        return;
      }

      const assetId = decodeURIComponent(match[1]);
      const url = resourceUrl(request, serverOptions);
      const paymentRequired = buildPaymentRequired(url, serverOptions);
      const requirements = paymentRequired.accepts[0];
      const signatureHeader = request.headers["payment-signature"];

      if (!signatureHeader) {
        jsonResponse(response, 402, paymentRequired, {
          "PAYMENT-REQUIRED": encodeBase64Json(paymentRequired),
        });
        return;
      }

      const paymentPayload = decodeBase64Json(Array.isArray(signatureHeader) ? signatureHeader[0] : signatureHeader);
      const verification = await verifyWithFacilitator(paymentPayload, requirements, serverOptions);
      if (!verification.isValid) {
        jsonResponse(response, 402, { ...paymentRequired, verification }, {
          "PAYMENT-REQUIRED": encodeBase64Json(paymentRequired),
        });
        return;
      }

      const settlement = await settleWithFacilitator(paymentPayload, requirements, serverOptions);
      if (!settlement.success) {
        jsonResponse(response, 402, { ...paymentRequired, settlement }, {
          "PAYMENT-REQUIRED": encodeBase64Json(paymentRequired),
          "PAYMENT-RESPONSE": encodeBase64Json(settlement),
        });
        return;
      }

      jsonResponse(response, 200, buildMockPremiumRiskScore(assetId), {
        "PAYMENT-RESPONSE": encodeBase64Json(settlement),
      });
    } catch (error) {
      jsonResponse(response, 500, {
        error: "oracle_server_error",
        message: error instanceof Error ? error.message : String(error),
      });
    }
  });
}

export function isDirectCliEntrypoint(metaUrl, argvEntry) {
  return argvEntry !== undefined && fileURLToPath(metaUrl) === resolve(argvEntry);
}

if (isDirectCliEntrypoint(import.meta.url, process.argv[1])) {
  const port = Number(process.env.ORACLE_SERVER_PORT ?? 3002);
  const server = createOracleServer({ port });
  server.listen(port, "127.0.0.1", () => {
    console.log(`[ORACLE_SERVER] listening on http://127.0.0.1:${port}`);
  });
}
