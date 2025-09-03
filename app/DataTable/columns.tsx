'use client'

import { Checkbox } from '@/components/ui/checkbox'
import { ColumnDef } from "@tanstack/react-table"

export type Person = {
  id: string
  name: string
  position: number
  state: string
  bio: string
  language: string
  version: number
  createdDate: string
}

export const columns: ColumnDef<Person>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <div className="text-center">{row.index + 1}</div>
    ),
    enableSorting: false,
    enableHiding: false,
    maxSize: 50,
  },
  {
    accessorKey: "id",
    header: "Id",
    size: 200,
  },
  {
    accessorKey: "bio",
    header: "Bio",
    size: 400,
  },
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "language",
    header: "Language",
    size: 100
  },
  {
    accessorKey: "version",
    header: "Version",
    size: 100
  },
  {
    accessorKey: "state",
    header: "State",
    size: 100
  },
  {
    accessorKey: "createdDate",
    header: "Created Date",
    minSize: 250,
    size: 250,
  }
]