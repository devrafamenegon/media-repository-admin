import { getGraphMediaPerMonth } from "@/actions/get-graph-media-per-month";
import { getMediasCount } from "@/actions/get-medias-count";
import { getParticipantsCount } from "@/actions/get-participants-count";
import Overview from "@/components/overview";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { User, Video } from "lucide-react";

export default async function MainPage() {
  const mediasCount = await getMediasCount();
  const participantsCount = await getParticipantsCount();
  const graphMediaPerMonth = await getGraphMediaPerMonth();
  
  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <Heading title="Overview" description="Overview of your media repository" />
        <Separator />
        <div className="grid gap-4 grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Medias
              </CardTitle>
              <Video className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {mediasCount}
              </div>
            </CardContent>
          </Card><Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Participants
              </CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {participantsCount}
              </div>
            </CardContent>
          </Card>
        </div>
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Medias per month</CardTitle>
          </CardHeader>
          <CardContent>
            <Overview data={graphMediaPerMonth} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
