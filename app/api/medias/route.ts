import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

import prismadb from "@/lib/prismadb";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization"
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders })
}

export async function POST(
  req: Request,
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

    if (!participantId) {
      return new NextResponse("Participant ID is required", { status: 400 })
    }

    const media = await prismadb.media.create({
      data: {
        label,
        url,
        participantId,
        userId
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
    const medias = await prismadb.media.findMany({
      orderBy: {
        createdAt: 'desc'
      } 
    })

    return NextResponse.json(medias, {
      headers: corsHeaders
    });
  } catch (error) {
    console.log('[MEDIAS_GET]', error);
    return new NextResponse("Internal error", { status: 500 })
  }
}