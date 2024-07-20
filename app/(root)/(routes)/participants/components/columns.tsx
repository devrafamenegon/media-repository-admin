"use client"

import { ColumnDef } from "@tanstack/react-table"

import { CellAction } from "./cell-action"

export type ParticipantColumn = {
  id: string
  name: string,
  createdAt: string,
  txtColor: string,
  bgColor: string
}

export const columns: ColumnDef<ParticipantColumn>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "createdAt",
    header: "Date",
  },
  {
    accessorKey: "txtColor",
    header: "Txt Color",
    cell: ({ row }) => (
      <div className="flex items-center gap-x-2">
        {row.original.txtColor}
        <div 
          className="h-6 w-6 rounded-full border" 
          style={{ backgroundColor: row.original.txtColor }} 
        />
      </div>
    )
  },
  {
    accessorKey: "bgColor",
    header: "Bg Color",
    cell: ({ row }) => (
      <div className="flex items-center gap-x-2">
        {row.original.bgColor}
        <div 
          className="h-6 w-6 rounded-full border" 
          style={{ backgroundColor: row.original.bgColor }} 
        />
      </div>
    )
  },
  {
    id: "actions",
    cell: ({ row }) => <CellAction data={row.original}/>
  }
]
