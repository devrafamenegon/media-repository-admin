import prismadb from "@/lib/prismadb";
import { format } from "date-fns";

import { MediaClient } from "./components/client";
import { MediaColumn } from "./components/columns";

const MediasPage = async () => {
  const medias = await prismadb.media.findMany({
    include: {
      participant: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  const formattedMedias: MediaColumn[] = medias.map((item) => ({
    id: item.id,
    label: item.label,
    participant: item.participant.name,
    isNsfw: item.isNsfw,
    createdAt: format(item.createdAt, "MMMM do, yyyy")
  }));

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <MediaClient data={formattedMedias}/>
      </div>
    </div>
  )
}

export default MediasPage;