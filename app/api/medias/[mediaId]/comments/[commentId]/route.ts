import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

import prismadb from "@/lib/prismadb";

export async function OPTIONS() {
  return new NextResponse(null, { status: 204 });
}

export async function DELETE(
  req: Request,
  { params }: { params: { mediaId: string; commentId: string } }
) {
  try {
    const { userId } = auth();

    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 401 });
    }

    if (!params.mediaId) {
      return new NextResponse("Media ID is required", { status: 400 });
    }

    if (!params.commentId) {
      return new NextResponse("Comment ID is required", { status: 400 });
    }

    const comment = await prismadb.mediaComment.findUnique({
      where: { id: params.commentId },
    });

    if (!comment || comment.mediaId !== params.mediaId) {
      return new NextResponse("Not found", { status: 404 });
    }

    if (comment.userId !== userId) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    await prismadb.mediaComment.delete({
      where: { id: params.commentId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.log("[MEDIA_COMMENT_DELETE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

