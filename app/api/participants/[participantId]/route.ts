import prismadb from "@/lib/prismadb";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET (
  req: Request,
  { params }: { params: { participantId: string }}
) {
  try {
    if (!params.participantId) {
      return new NextResponse("Participant ID is required", { status: 400 })
    }

    const participant = await prismadb.participant.findUnique({
      where: {
        id: params.participantId,
      },
    })

    return NextResponse.json(participant);
  } catch (error) {
    console.log('[PARTICIPANT_GET', error);
    return new NextResponse("Internal error", { status: 500 })
  }
}

export async function PATCH (
  req: Request,
  { params }: { params: { participantId: string }}
) {
  try {
    const { userId } = auth();
    const body = await req.json();

    const { name } = body;

    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 401 })
    }

    if (!name) {
      return new NextResponse("Name is required", { status: 400 })
    }

    if (!params.participantId) {
      return new NextResponse("Participant ID is required", { status: 400 })
    }

    const participant = await prismadb.participant.updateMany({
      where: {
        id: params.participantId,
      },
      data: {
        name,
      }
    })

    return NextResponse.json(participant);
  } catch (error) {
    console.log('[PARTICIPANT_PATCH]', error);
    return new NextResponse("Internal error", { status: 500 })
  }
}

export async function DELETE (
  req: Request,
  { params }: { params: { participantId: string }}
) {
  try {
    const { userId } = auth();

    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 401 })
    }

    if (!params.participantId) {
      return new NextResponse("Participant ID is required", { status: 400 })
    }

    const participant = await prismadb.participant.deleteMany({
      where: {
        id: params.participantId,
      },
    })

    return NextResponse.json(participant);
  } catch (error) {
    console.log('[PARTICIPANT_DELETE', error);
    return new NextResponse("Internal error", { status: 500 })
  }
}