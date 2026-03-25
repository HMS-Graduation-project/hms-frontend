import { useState, useEffect, useCallback, useMemo } from "react";
import type { SortOrder } from "@/lib/types";

interface UseDataTableOptions {
  initialPage?: number;
  initialLimit?: number;
  initialSortBy?: string;
  initialSortOrder?: SortOrder;
  initialSearch?: string;
  debounceMs?: number;
}

interface UseDataTableReturn {
  page: number;
  limit: number;
  sortBy: string | undefined;
  sortOrder: SortOrder;
  search: string;
  debouncedSearch: string;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  setSortBy: (sortBy: string) => void;
  setSortOrder: (sortOrder: SortOrder) => void;
  setSearch: (search: string) => void;
  onSortChange: (sortBy: string, sortOrder: SortOrder) => void;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  onSearchChange: (search: string) => void;
  queryParams: Record<string, string | number>;
}

export function useDataTable(
  options: UseDataTableOptions = {}
): UseDataTableReturn {
  const {
    initialPage = 1,
    initialLimit = 10,
    initialSortBy,
    initialSortOrder = "asc",
    initialSearch = "",
    debounceMs = 300,
  } = options;

  const [page, setPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);
  const [sortBy, setSortBy] = useState<string | undefined>(initialSortBy);
  const [sortOrder, setSortOrder] = useState<SortOrder>(initialSortOrder);
  const [search, setSearch] = useState(initialSearch);
  const [debouncedSearch, setDebouncedSearch] = useState(initialSearch);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [search, debounceMs]);

  // Reset to page 1 when search or limit changes
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, limit]);

  const onSortChange = useCallback(
    (newSortBy: string, newSortOrder: SortOrder) => {
      setSortBy(newSortBy);
      setSortOrder(newSortOrder);
      setPage(1);
    },
    []
  );

  const onPageChange = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  const onLimitChange = useCallback((newLimit: number) => {
    setLimit(newLimit);
  }, []);

  const onSearchChange = useCallback((newSearch: string) => {
    setSearch(newSearch);
  }, []);

  const queryParams = useMemo(() => {
    const params: Record<string, string | number> = {
      page,
      limit,
    };

    if (sortBy) {
      params.sortBy = sortBy;
      params.sortOrder = sortOrder;
    }

    if (debouncedSearch) {
      params.search = debouncedSearch;
    }

    return params;
  }, [page, limit, sortBy, sortOrder, debouncedSearch]);

  return {
    page,
    limit,
    sortBy,
    sortOrder,
    search,
    debouncedSearch,
    setPage,
    setLimit,
    setSortBy,
    setSortOrder,
    setSearch,
    onSortChange,
    onPageChange,
    onLimitChange,
    onSearchChange,
    queryParams,
  };
}
