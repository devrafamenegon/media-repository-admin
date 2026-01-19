import { auth } from "@clerk/nextjs/server";
import { verifyAdminAccessToken } from "@/lib/app-token";

function getBearerToken(req: Request): string | null {
  const h = req.headers.get("authorization") || req.headers.get("Authorization") || "";
  const m = /^Bearer\s+(.+)$/i.exec(h.trim());
  return m?.[1] ? m[1].trim() : null;
}

/**
 * Resolve o userId de forma compatível com:
 * - Cookie-based auth (mesmo domínio)
 * - Bearer token (apps/domínios diferentes)
 */
export async function getRequestUserId(req: Request): Promise<string | null> {
  const bearer = getBearerToken(req);
  if (bearer) {
    // Primeiro tenta token próprio do admin (emitido via /api/auth/exchange)
    const verified = verifyAdminAccessToken(bearer);
    if (verified?.userId) return verified.userId;
    return null;
  }

  const { userId } = auth();
  return userId || null;
}

