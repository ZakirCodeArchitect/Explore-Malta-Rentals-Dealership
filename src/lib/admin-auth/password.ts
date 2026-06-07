import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";

const SCRYPT_N = 16384;
const SCRYPT_R = 8;
const SCRYPT_P = 1;
const KEY_LENGTH = 64;
const SALT_LENGTH = 16;

function scryptDerive(
  password: string,
  salt: Buffer,
  keyLength: number,
  options: { N: number; r: number; p: number },
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scrypt(password, salt, keyLength, options, (error, derivedKey) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(derivedKey as Buffer);
    });
  });
}

function encodeHash(salt: Buffer, derivedKey: Buffer): string {
  return [
    "scrypt",
    String(SCRYPT_N),
    String(SCRYPT_R),
    String(SCRYPT_P),
    salt.toString("base64url"),
    derivedKey.toString("base64url"),
  ].join("$");
}

function decodeHash(stored: string): {
  n: number;
  r: number;
  p: number;
  salt: Buffer;
  derivedKey: Buffer;
} | null {
  const parts = stored.split("$");
  if (parts.length !== 6 || parts[0] !== "scrypt") {
    return null;
  }

  const n = Number(parts[1]);
  const r = Number(parts[2]);
  const p = Number(parts[3]);
  if (!Number.isFinite(n) || !Number.isFinite(r) || !Number.isFinite(p)) {
    return null;
  }

  try {
    return {
      n,
      r,
      p,
      salt: Buffer.from(parts[4], "base64url"),
      derivedKey: Buffer.from(parts[5], "base64url"),
    };
  } catch {
    return null;
  }
}

export async function hashAdminPassword(password: string): Promise<string> {
  const salt = randomBytes(SALT_LENGTH);
  const derivedKey = await scryptDerive(password, salt, KEY_LENGTH, {
    N: SCRYPT_N,
    r: SCRYPT_R,
    p: SCRYPT_P,
  });
  return encodeHash(salt, derivedKey);
}

export async function verifyAdminPassword(
  password: string,
  storedHash: string | null | undefined,
): Promise<boolean> {
  if (!storedHash) {
    return false;
  }

  const decoded = decodeHash(storedHash);
  if (!decoded) {
    return false;
  }

  const derivedKey = await scryptDerive(password, decoded.salt, decoded.derivedKey.length, {
    N: decoded.n,
    r: decoded.r,
    p: decoded.p,
  });

  if (derivedKey.length !== decoded.derivedKey.length) {
    return false;
  }

  return timingSafeEqual(derivedKey, decoded.derivedKey);
}
