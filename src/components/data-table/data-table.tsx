import type React from "react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import type { DataTableColumn, PaginationMeta, SortOrder } from "@/lib/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { DataTableColumnHeader } from "./data-table-column-header";
import { DataTableToolbar } from "./data-table-toolbar";
import { DataTablePagination } from "./data-table-pagination";

interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  data: T[];
  meta?: PaginationMeta;
  isLoading?: boolean;
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: SortOrder;
  search?: string;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  onSortChange: (sortBy: string, sortOrder: SortOrder) => void;
  onSearchChange: (search: string) => void;
  filterSlot?: React.ReactNode;
  onRowClick?: (row: T) => void;
}

export function DataTable<T>({
  columns,
  data,
  meta,
  isLoading = false,
  page,
  limit,
  sortBy,
  sortOrder,
  search,
  onPageChange,
  onLimitChange,
  onSortChange,
  onSearchChange,
  filterSlot,
  onRowClick,
}: DataTableProps<T>) {
  const { t } = useTranslation("common");

  const skeletonRows = Array.from({ length: limit }, (_, i) => i);

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <DataTableToolbar search={search} onSearchChange={onSearchChange}>
        {filterSlot}
      </DataTableToolbar>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead key={column.key} className={column.className}>
                  <DataTableColumnHeader
                    label={column.label}
                    sortable={column.sortable}
                    sortBy={column.key}
                    currentSortBy={sortBy}
                    currentSortOrder={sortOrder}
                    onSortChange={onSortChange}
                  />
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              // Loading skeleton rows
              skeletonRows.map((index) => (
                <TableRow key={index}>
                  {columns.map((column) => (
                    <TableCell
                      key={column.key}
                      className={cn("min-h-[44px]", column.className)}
                    >
                      <Skeleton className="h-5 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : data.length === 0 ? (
              // Empty state
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-muted-foreground"
                >
                  {t("noResults")}
                </TableCell>
              </TableRow>
            ) : (
              // Data rows
              data.map((row, rowIndex) => (
                <TableRow
                  key={rowIndex}
                  className={cn(
                    "min-h-[44px]",
                    onRowClick && "cursor-pointer"
                  )}
                  onClick={() => onRowClick?.(row)}
                >
                  {columns.map((column) => (
                    <TableCell key={column.key} className={column.className}>
                      {column.render
                        ? column.render(row)
                        : String(
                            (row as Record<string, unknown>)[column.key] ?? ""
                          )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <DataTablePagination
        meta={meta}
        page={page}
        limit={limit}
        onPageChange={onPageChange}
        onLimitChange={onLimitChange}
      />
    </div>
  );
}
