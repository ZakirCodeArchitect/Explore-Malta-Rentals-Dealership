import { createHash, randomBytes, timingSafeEqual } from "node:crypto";

const TOKEN_BYTE_LENGTH = 32;

export function generateSessionToken(): string {
  return randomBytes(TOKEN_BYTE_LENGTH).toString("base64url");
}

export function hashSessionToken(token: string): string {
  return createHash("sha256").update(token, "utf8").digest("hex");
}

export function sessionTokensMatch(token: string, storedHash: string): boolean {
  const candidate = hashSessionToken(token);
  const expected = Buffer.from(storedHash, "hex");
  const actual = Buffer.from(candidate, "hex");

  if (expected.length !== actual.length) {
    return false;
  }

  return timingSafeEqual(expected, actual);
}
