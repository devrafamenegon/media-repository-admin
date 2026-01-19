import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";

import prismadb from "@/lib/prismadb";

export async function OPTIONS() {
  return new NextResponse(null, { status: 204 });
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const seed = searchParams.get("seed") || "";
    if (!seed) {
      return new NextResponse("seed is required", { status: 400 });
    }

    const participantId = searchParams.get("participantId") || undefined;

    const cursorRaw = searchParams.get("cursor");
    const takeRaw = searchParams.get("take");

    const cursor = Math.max(0, Number.parseInt(cursorRaw || "0", 10) || 0);
    const takeUnclamped = Number.parseInt(takeRaw || "10", 10) || 10;
    const take = Math.min(30, Math.max(1, takeUnclamped));

    const whereParts: Prisma.Sql[] = [Prisma.sql`"isNsfw" = false`];
    if (participantId) {
      whereParts.push(Prisma.sql`"participantId" = ${participantId}`);
    }
    // Prisma.join espera o separador como string (não Prisma.sql) nessa versão do client.
    const whereSql = Prisma.join(whereParts, " AND ");

    // Shuffle determinístico por seed, estável durante a sessão no client.
    // md5(concat("id", seed)) gera uma ordem pseudo-aleatória, mas reprodutível.
    const items = await prismadb.$queryRaw(
      Prisma.sql`
        SELECT *
        FROM "Media"
        WHERE ${whereSql}
        ORDER BY md5(concat("id", ${seed}))
        OFFSET ${cursor}
        LIMIT ${take}
      `
    );

    const typedItems = items as unknown as Array<Record<string, unknown>>;

    const nextCursor =
      typedItems.length === take && typedItems.length > 0 ? cursor + typedItems.length : null;

    return NextResponse.json({ items: typedItems, nextCursor });
  } catch (error) {
    console.log("[MEDIAS_FEED_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

