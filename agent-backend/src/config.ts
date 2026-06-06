import type { AgentConfig, AgentMode } from "./types.js";

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

  return {
    mode,
    chainName: env.CASPER_CHAIN_NAME || "casper-test",
    nodeAddress: env.CASPER_NODE_ADDRESS || "https://node.testnet.cspr.cloud",
    contractPackageHash: env.CASPER_CONTRACT_PACKAGE_HASH || "mock-contract-package-hash",
    secretKeyPath: env.CASPER_SECRET_KEY_PATH,
    publishThreshold: numericEnv(env, "CASPER_PUBLISH_THRESHOLD", 60, 1, 100),
    intervalSeconds: numericEnv(env, "CASPER_AGENT_INTERVAL_SECONDS", 60, 1, 86_400),
  };
}
