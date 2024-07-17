"use client"

import { ColumnDef } from "@tanstack/react-table"

import { CellAction } from "./cell-action"

export type MediaColumn = {
  id: string,
  label: string,
  participant: string,
  createdAt: string,
  isNsfw: boolean
}

export const columns: ColumnDef<MediaColumn>[] = [
  {
    accessorKey: "label",
    header: "Label",
  },
  {
    accessorKey: "participant",
    header: "Participant",
  },
  {
    accessorKey: "createdAt",
    header: "Date",
  },
  {
    accessorKey: "isNsfw",
    header: "IsNfsw",
  },
  {
    id: "actions",
    cell: ({ row }) => <CellAction data={row.original}/>
  }
]
