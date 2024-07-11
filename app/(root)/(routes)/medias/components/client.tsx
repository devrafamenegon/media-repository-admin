"use client";

import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { DataTable } from "@/components/ui/data-table";

import { MediaColumn, columns } from "./columns";

interface MediaClientProps {
  data: MediaColumn[]
}

export const MediaClient: React.FC<MediaClientProps> = ({
  data
}) => {
  const router = useRouter();

  return (
    <>
      <div className="flex items-center justify-between">
        <Heading 
          title={`Medias (${data.length})`} 
          description="Manage medias"
        />
        <Button onClick={() => router.push(`/medias/new`)}>
          <Plus className="mr-2 h-4 w-4"/>
          Add New
        </Button>
      </div>
      <Separator />
      <DataTable searchKey="label" columns={columns} data={data}/>
      <Separator />
    </>
  )
}