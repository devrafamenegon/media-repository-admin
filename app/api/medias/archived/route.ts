import { NextResponse } from "next/server";

import prismadb from "@/lib/prismadb";

export async function GET(
  req: Request,
) {
  try {
    const { searchParams } = new URL(req.url);

    const participantId = searchParams.get("participantId") || undefined;

    const medias = await prismadb.media.findMany({
      where: {
        participantId,
        isNsfw: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(medias);
  } catch (error) {
    console.log('[MEDIAS_ARCHIVED_GET]', error);
    return new NextResponse("Internal error", { status: 500 })
  }
}