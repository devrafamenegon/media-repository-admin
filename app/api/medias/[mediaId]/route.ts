import prismadb from "@/lib/prismadb";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET (
  req: Request,
  { params }: { params: { mediaId: string }}
) {
  try {
    if (!params.mediaId) {
      return new NextResponse("Media ID is required", { status: 400 })
    }

    const media = await prismadb.media.findUnique({
      where: {
        id: params.mediaId,
      },
    })

    return NextResponse.json(media);
  } catch (error) {
    console.log('[MEDIA_GET', error);
    return new NextResponse("Internal error", { status: 500 })
  }
}

export async function PATCH (
  req: Request,
  { params }: { params: { mediaId: string }}
) {
  try {
    const { userId } = auth();
    const body = await req.json();

    const { label, url, participantId } = body;

    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 401 })
    }

    if (!label) {
      return new NextResponse("Label is required", { status: 400 })
    }

    if (!url) {
      return new NextResponse("Url is required", { status: 400 })
    }

    if (!params.mediaId) {
      return new NextResponse("Media ID is required", { status: 400 })
    }

    const media = await prismadb.media.updateMany({
      where: {
        id: params.mediaId,
      },
      data: {
        label,
        url,
        participantId,
        userId
      }
    })

    return NextResponse.json(media);
  } catch (error) {
    console.log('[MEDIA_PATCH]', error);
    return new NextResponse("Internal error", { status: 500 })
  }
}

export async function DELETE (
  req: Request,
  { params }: { params: { mediaId: string }}
) {
  try {
    const { userId } = auth();

    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 401 })
    }

    if (!params.mediaId) {
      return new NextResponse("Media ID is required", { status: 400 })
    }

    const media = await prismadb.media.deleteMany({
      where: {
        id: params.mediaId,
      },
    })

    return NextResponse.json(media);
  } catch (error) {
    console.log('[MEDIA_DELETE', error);
    return new NextResponse("Internal error", { status: 500 })
  }
}