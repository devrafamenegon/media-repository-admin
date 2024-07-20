import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

import prismadb from "@/lib/prismadb";

export async function POST(
  req: Request,
) {
  try {
    const { userId } = auth();
    const body = await req.json();
    const { name, txtColor, bgColor } = body;

    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 401 })
    }

    if (!name) {
      return new NextResponse("Name is required", { status: 400 })
    }

    if (!txtColor) {
      return new NextResponse("Text color is required", { status: 400 })
    }

    if (!bgColor) {
      return new NextResponse("Background color is required", { status: 400 })
    }

    const participant = await prismadb.participant.create({
      data: {
        name,
        txtColor,
        bgColor
      }
    })

    return NextResponse.json(participant);
  } catch (error) {
    console.log('[PARTICIPANTS_POST]', error);
    return new NextResponse("Internal error", { status: 500 })
  }
}

export async function GET(
  req: Request,
) {
  try {
    const participants = await prismadb.participant.findMany({
      orderBy: {
        name: 'asc'
      } 
    })

    return NextResponse.json(participants);
  } catch (error) {
    console.log('[PARTICIPANTS_GET]', error);
    return new NextResponse("Internal error", { status: 500 })
  }
}