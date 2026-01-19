import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

import prismadb from "@/lib/prismadb";

export async function OPTIONS() {
  return new NextResponse(null, { status: 204 });
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const all = searchParams.get("all") === "1";

    const { userId } = auth();

    const types = await prismadb.reactionType.findMany({
      where: all && userId ? undefined : { isActive: true },
      orderBy: [{ order: "asc" }, { createdAt: "asc" }],
    });

    return NextResponse.json(types);
  } catch (error) {
    console.log("[REACTION_TYPES_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { userId } = auth();
    const body = await req.json();
    const { key, label, emoji, order, isActive } = body ?? {};

    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 401 });
    }

    if (!key) {
      return new NextResponse("Key is required", { status: 400 });
    }
    if (!label) {
      return new NextResponse("Label is required", { status: 400 });
    }

    const created = await prismadb.reactionType.create({
      data: {
        key: String(key).trim().toUpperCase(),
        label: String(label).trim(),
        emoji: emoji ? String(emoji) : null,
        order: typeof order === "number" ? order : 0,
        isActive: typeof isActive === "boolean" ? isActive : true,
      },
    });

    return NextResponse.json(created);
  } catch (error) {
    console.log("[REACTION_TYPES_POST]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const { userId } = auth();
    const body = await req.json();
    const { id, key, label, emoji, order, isActive } = body ?? {};

    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 401 });
    }

    if (!id) {
      return new NextResponse("ReactionType id is required", { status: 400 });
    }

    const updated = await prismadb.reactionType.update({
      where: { id: String(id) },
      data: {
        ...(key !== undefined ? { key: String(key).trim().toUpperCase() } : {}),
        ...(label !== undefined ? { label: String(label).trim() } : {}),
        ...(emoji !== undefined ? { emoji: emoji ? String(emoji) : null } : {}),
        ...(order !== undefined ? { order: Number(order) } : {}),
        ...(isActive !== undefined ? { isActive: Boolean(isActive) } : {}),
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.log("[REACTION_TYPES_PATCH]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { userId } = auth();
    const body = await req.json();
    const { id } = body ?? {};

    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 401 });
    }

    if (!id) {
      return new NextResponse("ReactionType id is required", { status: 400 });
    }

    await prismadb.reactionType.delete({
      where: { id: String(id) },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.log("[REACTION_TYPES_DELETE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

