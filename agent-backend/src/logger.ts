import type { Logger } from "./types.js";

const SECRET_KEY_PATTERN = /(secret|token|password|private[_-]?key|api[_-]?key|pem)/i;
const PRIVATE_KEY_BLOCK_PATTERN =
  /-----BEGIN [^-]*PRIVATE KEY-----[\s\S]*?-----END [^-]*PRIVATE KEY-----/g;
const INLINE_SECRET_PATTERN =
  /\b(secret|token|password|private[_-]?key|api[_-]?key|pem)=([^\s,}]+)/gi;

function redactValue(value: unknown): unknown {
  if (typeof value === "string") {
    return value
      .replace(PRIVATE_KEY_BLOCK_PATTERN, "[REDACTED_PRIVATE_KEY]")
      .replace(INLINE_SECRET_PATTERN, "$1=[REDACTED]");
  }
  if (Array.isArray(value)) {
    return value.map((item) => redactValue(item));
  }
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, nested]) => [
        key,
        SECRET_KEY_PATTERN.test(key) ? "[REDACTED]" : redactValue(nested),
      ]),
    );
  }
  return value;
}

export function redactSecrets(detail: Record<string, unknown> = {}): Record<string, unknown> {
  return redactValue(detail) as Record<string, unknown>;
}

export function createLogger(
  sink: (line: string) => void = (line) => console.log(line),
  now: () => Date = () => new Date(),
): Logger {
  return {
    event(module: string, action: string, detail: Record<string, unknown> = {}): string {
      const timestamp = now().toISOString();
      const safeDetail = redactSecrets(detail);
      const line = `[${timestamp}] [${module}] [${action}] ${JSON.stringify(safeDetail)}`;
      sink(line);
      return line;
    },
  };
}
