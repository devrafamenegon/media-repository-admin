import prismadb from "@/lib/prismadb"

export const getParticipantsCount = async () => {
  const participantsCount = await prismadb.participant.count();

  return participantsCount
}