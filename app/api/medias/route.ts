import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

import prismadb from "@/lib/prismadb";

export async function POST(
  req: Request,
) {
  try {
    const { userId } = auth();
    const body = await req.json();
    const { label, url, participantId, isNsfw } = body;

    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 401 })
    }

    if (!label) {
      return new NextResponse("Label is required", { status: 400 })
    }

    if (!url) {
      return new NextResponse("Url is required", { status: 400 })
    }

    if (!isNsfw) {
      return new NextResponse("Is Nsfw is required", { status: 400 })
    }

    if (!participantId) {
      return new NextResponse("Participant ID is required", { status: 400 })
    }

    const media = await prismadb.media.create({
      data: {
        label,
        url,
        participantId,
        userId,
        isNsfw
      }
    })

    return NextResponse.json(media);
  } catch (error) {
    console.log('[MEDIAS_POST]', error);
    return new NextResponse("Internal error", { status: 500 })
  }
}

export async function GET(
  req: Request,
) {
  try {
    const { searchParams } = new URL(req.url);

    const participantId = searchParams.get("participantId") || undefined;

    const medias = await prismadb.media.findMany({
      where: {
        participantId
      },
      orderBy: {
        createdAt: 'desc'
      } 
    })

    return NextResponse.json(medias);
  } catch (error) {
    console.log('[MEDIAS_GET]', error);
    return new NextResponse("Internal error", { status: 500 })
  }
}