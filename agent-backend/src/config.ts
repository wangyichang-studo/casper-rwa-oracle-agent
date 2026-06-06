import type { AgentConfig, AgentMode, X402Mode } from "./types.js";

const DEFAULT_X402_ASSET = "9824d60dc3a5c44a20b9fd260a412437933835b52fc683d8ae36e4ec2114843e";
const DEFAULT_X402_PAY_TO = "009e5669b070545e2b32bc66363b9d3d4390fca56bf52a05f1411b7fa18ca311c7";

function numericEnv(
  env: NodeJS.ProcessEnv,
  key: string,
  fallback: number,
  min: number,
  max: number,
): number {
  const raw = env[key];
  if (raw === undefined || raw.trim() === "") {
    return fallback;
  }
  const value = Number(raw);
  if (!Number.isFinite(value) || value < min || value > max) {
    throw new Error(`${key} must be a number between ${min} and ${max}`);
  }
  return value;
}

export function loadAgentConfig(env: NodeJS.ProcessEnv = process.env): AgentConfig {
  const requestedMode = env.CASPER_AGENT_MODE === "live" ? "live" : "mock";
  const mode: AgentMode = requestedMode;
  const requestedX402Mode: X402Mode = env.X402_MODE === "live" ? "live" : "mock";

  return {
    mode,
    chainName: env.CASPER_CHAIN_NAME || "casper-test",
    nodeAddress: env.CASPER_NODE_ADDRESS || "https://node.testnet.cspr.cloud",
    contractPackageHash: env.CASPER_CONTRACT_PACKAGE_HASH || "mock-contract-package-hash",
    secretKeyPath: env.CASPER_SECRET_KEY_PATH,
    publishThreshold: numericEnv(env, "CASPER_PUBLISH_THRESHOLD", 60, 1, 100),
    intervalSeconds: numericEnv(env, "CASPER_AGENT_INTERVAL_SECONDS", 60, 1, 86_400),
    x402: {
      enabled: env.X402_ENABLED !== "false",
      mode: requestedX402Mode,
      oracleBaseUrl: env.X402_ORACLE_BASE_URL || "mock://local-rwa-oracle",
      facilitatorUrl: env.X402_FACILITATOR_URL || "https://x402-facilitator.cspr.cloud",
      facilitatorToken: env.CSPR_CLOUD_ACCESS_TOKEN,
      network: env.X402_NETWORK === "casper:casper" ? "casper:casper" : "casper:casper-test",
      amount: env.X402_AMOUNT || "1000000000",
      asset: env.X402_ASSET || DEFAULT_X402_ASSET,
      payTo: env.X402_PAY_TO || DEFAULT_X402_PAY_TO,
      maxTimeoutSeconds: numericEnv(env, "X402_MAX_TIMEOUT_SECONDS", 900, 6, 86_400),
    },
  };
}
