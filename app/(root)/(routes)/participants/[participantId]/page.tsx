import prismadb from "@/lib/prismadb";

import { ParticipantForm } from "./components/participant-form";

const ParticipantPage = async ({
  params
}: {
  params: { participantId: string }
}) => {
  const participant = await prismadb.participant.findUnique({
    where: {
      id: params.participantId
    }
  });

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <ParticipantForm initialData={participant}/>
      </div>
    </div>
  )
}

export default ParticipantPage;