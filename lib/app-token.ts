import crypto from "crypto";

type AppTokenPayload = {
  sub: string; // userId (do Clerk do client)
  iat: number;
  exp: number;
  iss: string;
  aud: string;
};

function base64UrlEncode(input: Buffer | string) {
  const b = Buffer.isBuffer(input) ? input : Buffer.from(input);
  return b
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function base64UrlDecodeToBuffer(input: string) {
  const padLen = (4 - (input.length % 4)) % 4;
  const padded = input.replace(/-/g, "+").replace(/_/g, "/") + "=".repeat(padLen);
  return Buffer.from(padded, "base64");
}

function signHs256(data: string, secret: string) {
  return crypto.createHmac("sha256", secret).update(data).digest();
}

export function issueAdminAccessToken(userId: string, opts?: { ttlSeconds?: number }) {
  const secret = process.env.ADMIN_APP_TOKEN_SECRET;
  if (!secret) throw new Error("ADMIN_APP_TOKEN_SECRET is not set");

  const now = Math.floor(Date.now() / 1000);
  const ttl = Math.max(60, opts?.ttlSeconds ?? 60 * 60); // default 1h

  const header = { alg: "HS256", typ: "JWT" };
  const payload: AppTokenPayload = {
    sub: userId,
    iat: now,
    exp: now + ttl,
    iss: "media-repository-admin",
    aud: "media-repository-client",
  };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const signingInput = `${encodedHeader}.${encodedPayload}`;
  const sig = base64UrlEncode(signHs256(signingInput, secret));

  return {
    token: `${signingInput}.${sig}`,
    expiresAt: payload.exp,
  };
}

export function verifyAdminAccessToken(token: string): { userId: string } | null {
  const secret = process.env.ADMIN_APP_TOKEN_SECRET;
  if (!secret) return null;

  const parts = token.split(".");
  if (parts.length !== 3) return null;

  const [h, p, s] = parts;
  const signingInput = `${h}.${p}`;

  const expected = signHs256(signingInput, secret);
  const actual = base64UrlDecodeToBuffer(s);

  // timingSafeEqual exige buffers do mesmo tamanho
  if (actual.length !== expected.length) return null;
  if (!crypto.timingSafeEqual(actual, expected)) return null;

  let payload: AppTokenPayload;
  try {
    payload = JSON.parse(base64UrlDecodeToBuffer(p).toString("utf8")) as AppTokenPayload;
  } catch {
    return null;
  }

  const now = Math.floor(Date.now() / 1000);
  if (!payload?.sub) return null;
  if (payload.iss !== "media-repository-admin") return null;
  if (payload.aud !== "media-repository-client") return null;
  if (typeof payload.exp !== "number" || payload.exp <= now) return null;

  return { userId: payload.sub };
}

