import prismadb from "@/lib/prismadb"

export const getMediasCount = async () => {
  const mediasCount = await prismadb.media.count();

  return mediasCount
}