import { NextResponse } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";

import prismadb from "@/lib/prismadb";
import { getRequestUserId } from "@/lib/request-auth";

export async function OPTIONS() {
  return new NextResponse(null, { status: 204 });
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

    const comments = await prismadb.mediaComment.findMany({
      where: { mediaId: params.mediaId },
      orderBy: { createdAt: "desc" },
      take: 200,
    });

    return NextResponse.json(comments);
  } catch (error) {
    console.log("[MEDIA_COMMENTS_GET]", error);
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
    const { body: commentBody } = body ?? {};

    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 401 });
    }

    if (!params.mediaId) {
      return new NextResponse("Media ID is required", { status: 400 });
    }

    if (!commentBody || !String(commentBody).trim()) {
      return new NextResponse("Comment body is required", { status: 400 });
    }

    let authorName: string | null = null;
    let authorImageUrl: string | null = null;
    try {
      const user = await clerkClient.users.getUser(userId);
      authorName =
        user.fullName ||
        user.username ||
        user.primaryEmailAddress?.emailAddress ||
        null;
      authorImageUrl = user.imageUrl || null;
    } catch (e) {
      // ignore lookup failures; still allow comment creation
      console.log("[MEDIA_COMMENTS_POST][CLERK_LOOKUP_FAILED]", e);
    }

    const created = await prismadb.mediaComment.create({
      data: {
        mediaId: params.mediaId,
        userId,
        body: String(commentBody).trim(),
        authorName,
        authorImageUrl,
      },
    });

    return NextResponse.json(created);
  } catch (error) {
    console.log("[MEDIA_COMMENTS_POST]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

