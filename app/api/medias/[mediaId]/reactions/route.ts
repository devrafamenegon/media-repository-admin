import { NextResponse } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";

import prismadb from "@/lib/prismadb";
import { getRequestUserId } from "@/lib/request-auth";

const prismaAny = prismadb as any;

type ReactionCountsResponse = {
  counts: Array<{ reactionTypeId: string; count: number }>;
  myReactionTypeIds: string[];
  topReactorsByType: Record<string, { names: string[]; moreCount: number }>;
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204 });
}

async function buildResponse(
  mediaId: string,
  userId: string
): Promise<ReactionCountsResponse> {
  const grouped = await prismadb.mediaReaction.groupBy({
    by: ["reactionTypeId"],
    where: { mediaId },
    _count: { _all: true },
  });

  const my = await prismadb.mediaReaction.findMany({
    where: { mediaId, userId },
    select: { reactionTypeId: true },
  });

  // Top 10 nomes por tipo (com +N) para hover no client.
  // Sem join no Clerk aqui (usamos authorName armazenado).
  const recent: Array<{ reactionTypeId: string; authorName?: string | null }> =
    await prismaAny.mediaReaction.findMany({
    where: { mediaId },
    orderBy: { createdAt: "desc" },
    select: { reactionTypeId: true, authorName: true },
    take: 500,
  });

  const countByType = new Map<string, number>();
  for (const g of grouped) countByType.set(g.reactionTypeId, g._count._all);

  const namesByType = new Map<string, string[]>();
  for (const r of recent) {
    const list = namesByType.get(r.reactionTypeId) ?? [];
    if (list.length >= 10) continue;
    const name = (r.authorName || "User").trim();
    // evita duplicar por segurança (mesmo sendo unique por user+type)
    if (!list.includes(name)) list.push(name);
    namesByType.set(r.reactionTypeId, list);
  }

  const topReactorsByType: Record<string, { names: string[]; moreCount: number }> = {};
  for (const [reactionTypeId, total] of Array.from(countByType.entries())) {
    const names = namesByType.get(reactionTypeId) ?? [];
    topReactorsByType[reactionTypeId] = {
      names,
      moreCount: Math.max(0, total - names.length),
    };
  }

  return {
    counts: grouped.map((g) => ({
      reactionTypeId: g.reactionTypeId,
      count: g._count._all,
    })),
    myReactionTypeIds: my.map((r) => r.reactionTypeId),
    topReactorsByType,
  };
}

export async function GET(
  req: Request,
  { params }: { params: { mediaId: string } }
) {
  try {
    const userId = await getRequestUserId(req);

    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 401 });
    }

    if (!params.mediaId) {
      return new NextResponse("Media ID is required", { status: 400 });
    }

    const data = await buildResponse(params.mediaId, userId);
    return NextResponse.json(data);
  } catch (error) {
    console.log("[MEDIA_REACTIONS_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: { mediaId: string } }
) {
  try {
    const userId = await getRequestUserId(req);
    const body = await req.json();
    const { reactionTypeId, authorName: authorNameRaw } = body ?? {};

    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 401 });
    }

    if (!params.mediaId) {
      return new NextResponse("Media ID is required", { status: 400 });
    }

    if (!reactionTypeId) {
      return new NextResponse("reactionTypeId is required", { status: 400 });
    }

    const type = await prismadb.reactionType.findUnique({
      where: { id: String(reactionTypeId) },
      select: { id: true, isActive: true },
    });

    if (!type || !type.isActive) {
      return new NextResponse("ReactionType not found", { status: 404 });
    }

    // Não depende de @@unique novo no Prisma Client (evita erro quando o client está desatualizado).
    // Garante "no máximo 1 por tipo" via checagem antes de criar.
    const existing = await prismadb.mediaReaction.findFirst({
      where: {
        mediaId: params.mediaId,
        userId,
        reactionTypeId: type.id,
      },
      select: { id: true },
    });

    const providedAuthorName =
      typeof authorNameRaw === "string" && authorNameRaw.trim() ? authorNameRaw.trim() : null;

    if (!existing) {
      let authorName: string | null = null;
      // Preferir nome enviado pelo client (Clerk do client). Fallback para Clerk do admin.
      authorName = providedAuthorName;
      if (!authorName) {
        try {
          const user = await clerkClient.users.getUser(userId);
          authorName =
            user.fullName ||
            user.username ||
            user.primaryEmailAddress?.emailAddress ||
            null;
        } catch (e) {
          console.log("[MEDIA_REACTIONS_POST][CLERK_LOOKUP_FAILED]", e);
        }
      }

      await prismaAny.mediaReaction.create({
        data: {
          mediaId: params.mediaId,
          userId,
          reactionTypeId: type.id,
          authorName,
        },
      });
    } else if (providedAuthorName) {
      // Atualiza registros existentes (útil para migrar de "User" -> nome real).
      await prismadb.mediaReaction.updateMany({
        where: {
          mediaId: params.mediaId,
          userId,
          reactionTypeId: type.id,
        },
        data: { authorName: providedAuthorName },
      });
    }

    const data = await buildResponse(params.mediaId, userId);
    return NextResponse.json(data);
  } catch (error) {
    console.log("[MEDIA_REACTIONS_POST]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { mediaId: string } }
) {
  try {
    const userId = await getRequestUserId(req);
    const body = await req.json().catch(() => null);
    const { reactionTypeId } = body ?? {};

    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 401 });
    }

    if (!params.mediaId) {
      return new NextResponse("Media ID is required", { status: 400 });
    }

    await prismadb.mediaReaction.deleteMany({
      where: {
        mediaId: params.mediaId,
        userId,
        ...(reactionTypeId ? { reactionTypeId: String(reactionTypeId) } : {}),
      },
    });

    const data = await buildResponse(params.mediaId, userId);
    return NextResponse.json(data);
  } catch (error) {
    console.log("[MEDIA_REACTIONS_DELETE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

