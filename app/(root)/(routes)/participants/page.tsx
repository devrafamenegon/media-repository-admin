import prismadb from "@/lib/prismadb";
import { format } from "date-fns";

import { ParticipantClient } from "./components/client";
import { ParticipantColumn } from "./components/columns";

const ParticipantsPage = async () => {
  const participants = await prismadb.participant.findMany({
    orderBy: {
      createdAt: 'desc'
    }
  });

  const formattedParticipants: ParticipantColumn[] = participants.map((item) => ({
    id: item.id,
    name: item.name,
    txtColor: item.txtColor,
    bgColor: item.bgColor,
    createdAt: format(item.createdAt, "MMMM do, yyyy")
  }));

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <ParticipantClient data={formattedParticipants}/>
      </div>
    </div>
  )
}

export default ParticipantsPage;