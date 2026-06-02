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
    <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
      <Table>

        {/* HEADER */}
        <TableHeader className="bg-gray-800 text-white dark:bg-gray-800 dark:text-gray-200">
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
              className="cursor-pointer border-t border-gray-100 text-gray-700 hover:bg-gray-50 dark:border-gray-800 dark:text-gray-300 dark:hover:bg-white/[0.04]"
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
