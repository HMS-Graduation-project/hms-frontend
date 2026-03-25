import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SortOrder } from "@/lib/types";
import { Button } from "@/components/ui/button";

interface DataTableColumnHeaderProps {
  label: string;
  sortable?: boolean;
  sortBy?: string;
  currentSortBy?: string;
  currentSortOrder?: SortOrder;
  onSortChange?: (sortBy: string, sortOrder: SortOrder) => void;
  className?: string;
}

export function DataTableColumnHeader({
  label,
  sortable = false,
  sortBy,
  currentSortBy,
  currentSortOrder,
  onSortChange,
  className,
}: DataTableColumnHeaderProps) {
  if (!sortable || !sortBy) {
    return (
      <span className={cn("text-sm font-medium", className)}>{label}</span>
    );
  }

  const isActive = currentSortBy === sortBy;

  const handleClick = () => {
    if (!onSortChange) return;

    if (!isActive) {
      onSortChange(sortBy, "asc");
    } else if (currentSortOrder === "asc") {
      onSortChange(sortBy, "desc");
    } else {
      onSortChange(sortBy, "asc");
    }
  };

  const SortIcon = isActive
    ? currentSortOrder === "asc"
      ? ArrowUp
      : ArrowDown
    : ArrowUpDown;

  return (
    <Button
      variant="ghost"
      size="sm"
      className={cn(
        "-ml-3 h-8 data-[state=active]:text-foreground",
        className
      )}
      onClick={handleClick}
      data-state={isActive ? "active" : undefined}
    >
      <span>{label}</span>
      <SortIcon className="ml-2 h-4 w-4" />
    </Button>
  );
}
