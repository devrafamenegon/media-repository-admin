import { NextResponse } from "next/server";

import prismadb from "@/lib/prismadb";
import { getRequestUserId } from "@/lib/request-auth";

export async function OPTIONS() {
  return new NextResponse(null, { status: 204 });
}

export async function POST(
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

    const media = await prismadb.media.update({
      where: { id: params.mediaId },
      data: { viewCount: { increment: 1 } },
      select: { viewCount: true },
    });

    return NextResponse.json(media);
  } catch (error) {
    console.log("[MEDIA_VIEW_POST]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

