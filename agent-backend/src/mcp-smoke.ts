import { createLogger, redactSecrets } from "./logger.js";

type TokenSummary = {
  symbol?: string;
  name?: string;
  address?: string;
};

type McpModule = {
  get_tokens?: unknown;
  getTokens?: unknown;
  default?: {
    get_tokens?: unknown;
    getTokens?: unknown;
  };
};

function pickGetTokens(moduleExports: McpModule): (() => Promise<unknown>) | undefined {
  const candidates = [
    moduleExports.get_tokens,
    moduleExports.getTokens,
    moduleExports.default?.get_tokens,
    moduleExports.default?.getTokens,
  ];
  const candidate = candidates.find((value) => typeof value === "function");
  return candidate as (() => Promise<unknown>) | undefined;
}

function summarizeTokens(value: unknown): TokenSummary[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.slice(0, 8).map((item) => {
    if (!item || typeof item !== "object") {
      return {};
    }
    const record = item as Record<string, unknown>;
    return {
      symbol: typeof record.symbol === "string" ? record.symbol : undefined,
      name: typeof record.name === "string" ? record.name : undefined,
      address:
        typeof record.address === "string"
          ? record.address
          : typeof record.contractPackageHash === "string"
            ? record.contractPackageHash
            : undefined,
    };
  });
}

async function main(): Promise<void> {
  const logger = createLogger();
  const moduleName = process.env.CSPR_TRADE_MCP_MODULE;

  logger.event("mcp-smoke", "START", {
    provider: "CSPR.trade MCP",
    method: "get_tokens",
  });

  if (!moduleName) {
    logger.event("mcp-smoke", "SKIPPED", {
      reason: "CSPR_TRADE_MCP_MODULE is not configured in this local environment.",
      nextStep:
        "When a CSPR.trade MCP bridge is available, expose a module with get_tokens and rerun npm run mcp:check.",
    });
    return;
  }

  const moduleExports = (await import(moduleName)) as McpModule;
  const getTokens = pickGetTokens(moduleExports);
  if (!getTokens) {
    throw new Error(`Configured MCP module '${moduleName}' does not expose get_tokens.`);
  }

  const response = await getTokens();
  const tokens = summarizeTokens(response);
  logger.event("mcp-smoke", "CONNECTED", {
    sampleCount: tokens.length,
    sampleTokens: tokens,
  });
}

main().catch((error: unknown) => {
  const logger = createLogger((line) => console.error(line));
  logger.event("mcp-smoke", "FAILED", {
    error: error instanceof Error ? error.message : String(error),
    detail: redactSecrets({ CSPR_TRADE_MCP_MODULE: process.env.CSPR_TRADE_MCP_MODULE }),
  });
  process.exitCode = 1;
});
