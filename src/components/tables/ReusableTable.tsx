'use client';

import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";

type Column<T> = {
  key: string;
  label: React.ReactNode;
  render?: (row: T) => React.ReactNode;
  className?: string;
};

type Props<T> = {
  data: T[];
  columns: Column<T>[];
  onRowClick?: (row: T) => void;
};

export default function ReusableTable<T>({
  data,
  columns,
  onRowClick,
}: Props<T>) {
  return (
    <div className="overflow-x-auto">
      <Table>

        {/* HEADER */}
        <TableHeader className="bg-gray-800 text-white">
  <TableRow>
    {columns.map((col) => (
      <TableCell
        key={col.key}
        isHeader
        className="px-4 py-3 text-left font-medium text-sm"
      >
        {col.label}
      </TableCell>
    ))}
  </TableRow>
</TableHeader>

        {/* BODY */}
        <TableBody>
          {data.map((row: any) => (
            <TableRow
              key={row.id}
              className="cursor-pointer hover:bg-gray-50"
              onClick={() => onRowClick?.(row)}
            >
              {columns.map((col) => (
                <TableCell key={col.key} className={`px-4 py-3 ${col.className || ""}`}>
                  {col.render ? col.render(row) : row[col.key]}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>

      </Table>
    </div>
  );
}