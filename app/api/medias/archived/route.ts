import { NextResponse } from "next/server";

import prismadb from "@/lib/prismadb";
import { auth } from "@clerk/nextjs/server";

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

export async function POST(
  req: Request,
) {
  try {
    const { password } = await req.json();

    if (!password) {
      return new NextResponse("Password is required", { status: 400 })
    }

    if (password.toString() === process.env.ARCHIVED_SECRET?.toString()) {
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: false });
  } catch (error) {
    console.log('[MEDIAS_ARCHIVED_POST]', error);
    return new NextResponse("Internal error", { status: 500 })
  }
}