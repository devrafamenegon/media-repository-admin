"use client";

import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { DataTable } from "@/components/ui/data-table";

import { ParticipantColumn, columns } from "./columns";

interface ParticipantClientProps {
  data: ParticipantColumn[]
}

export const SizeClient: React.FC<ParticipantClientProps> = ({
  data
}) => {
  const router = useRouter();

  return (
    <>
      <div className="flex items-center justify-between">
        <Heading 
          title={`Participants (${data.length})`} 
          description="Manage participants"
        />
        <Button onClick={() => router.push(`/participants/new`)}>
          <Plus className="mr-2 h-4 w-4"/>
          Add New
        </Button>
      </div>
      <Separator />
      <DataTable searchKey="name" columns={columns} data={data}/>
      <Separator />
    </>
  )
}