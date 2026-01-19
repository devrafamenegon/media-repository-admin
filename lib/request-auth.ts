import { auth } from "@clerk/nextjs/server";
import { verifyToken } from "@clerk/backend";

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
    try {
      const secretKey = process.env.CLERK_SECRET_KEY;
      // Se o secret não estiver configurado, a verificação não é possível.
      if (!secretKey) return null;

      const payload = await verifyToken(bearer, { secretKey });
      // No JWT do Clerk, o subject (sub) é o userId.
      return typeof payload?.sub === "string" && payload.sub ? payload.sub : null;
    } catch (e) {
      // Token inválido/expirado/etc.
      return null;
    }
  }

  const { userId } = auth();
  return userId || null;
}

