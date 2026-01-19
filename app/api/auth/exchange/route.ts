import { NextResponse } from "next/server";
import { verifyToken } from "@clerk/backend";

import { issueAdminAccessToken } from "@/lib/app-token";

function getBearerToken(req: Request): string | null {
  const h = req.headers.get("authorization") || req.headers.get("Authorization") || "";
  const m = /^Bearer\s+(.+)$/i.exec(h.trim());
  return m?.[1] ? m[1].trim() : null;
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204 });
}

export async function POST(req: Request) {
  try {
    const clerkToken = getBearerToken(req);
    if (!clerkToken) {
      return new NextResponse("Missing Bearer token", { status: 400 });
    }

    const jwtKey = process.env.CLIENT_CLERK_JWT_KEY;
    if (!jwtKey) {
      return new NextResponse("CLIENT_CLERK_JWT_KEY is not set", { status: 500 });
    }

    // Valida token do Clerk do CLIENT (projeto diferente) via JWT verification key.
    const payload = await verifyToken(clerkToken, { jwtKey });
    const userId = typeof payload?.sub === "string" ? payload.sub : null;

    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 401 });
    }

    const issued = issueAdminAccessToken(userId, { ttlSeconds: 60 * 60 }); // 1h
    return NextResponse.json({ token: issued.token, expiresAt: issued.expiresAt });
  } catch (e) {
    console.log("[AUTH_EXCHANGE_POST]", e);
    return new NextResponse("Unauthenticated", { status: 401 });
  }
}

