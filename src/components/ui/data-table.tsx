"use client"

import type { ReactNode } from "react"
import { useTable, type ColumnDef, type RowData } from "@tanstack/react-table"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { features, type DataTableFeatures } from "./data-table-features"

interface DataTableProps<TData extends RowData> {
  columns: ColumnDef<DataTableFeatures, TData, any>[]
  data: TData[]
  emptyContent?: ReactNode
}

export function DataTable<TData extends RowData>({
  columns,
  data,
  emptyContent = "No results.",
}: DataTableProps<TData>) {
  const table = useTable({
    features,
    data,
    columns,
  } as any)

  const rows = table.getRowModel().rows as any[]

  return (
    <div className="overflow-hidden rounded-md border">
      <Table>
        <TableHeader className="bg-muted">
          {table.getHeaderGroups().map((headerGroup: any) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header: any, index: number) => {
                const width = header.column.columnDef.meta?.width
                const isLastColumn = index === headerGroup.headers.length - 1
                return (
                  <TableHead
                    key={header.id}
                    className="h-9"
                    style={{
                      width,
                      minWidth: width,
                      maxWidth: width,
                      ...(isLastColumn ? {
                        position: "sticky",
                        right: 0,
                        zIndex: 10,
                        minWidth: 96,
                        background: "var(--muted)",
                      } : {}),
                    }}
                  >
                    {header.isPlaceholder
                      ? null
                      : table.FlexRender({ header } as any)}
                  </TableHead>
                )
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {rows?.length ? (
            rows.map((row: any) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected?.() && "selected"}
              >
                {row.getAllCells().map((cell: any, index: number, cells: any[]) => {
                  const width = cell.column.columnDef.meta?.width
                  const isLastColumn = index === cells.length - 1
                  return (
                    <TableCell
                      key={cell.id}
                      style={{
                        width,
                        minWidth: width,
                        maxWidth: width,
                        ...(isLastColumn ? {
                          position: "sticky",
                          right: 0,
                          zIndex: 5,
                          minWidth: 96,
                          background: "var(--background)",
                        } : {}),
                      }}
                    >
                      {table.FlexRender({ cell } as any)}
                    </TableCell>
                  )
                })}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                {emptyContent}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
