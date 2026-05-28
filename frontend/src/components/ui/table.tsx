"use client";

import * as React from "react";
import { useEffect } from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  PaginationState,
  Column,
  Row,
} from "@tanstack/react-table";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  ChevronUp,
  Search,
  Eye,
  Filter,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

const Select = React.forwardRef<
  HTMLSelectElement,
  React.ComponentProps<"select">
>(({ className, ...props }, ref) => {
  return (
    <select
      className={cn(
        "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        className,
      )}
      ref={ref}
      {...props}
    />
  );
});
Select.displayName = "Select";

function Table({ className, ...props }: React.ComponentProps<"table">) {
  return (
    <div
      data-slot="table-container"
      className="relative w-full overflow-x-auto"
    >
      <table
        data-slot="table"
        className={cn("w-full caption-bottom text-sm", className)}
        {...props}
      />
    </div>
  );
}

function TableHeader({ className, ...props }: React.ComponentProps<"thead">) {
  return (
    <thead
      data-slot="table-header"
      className={cn("[&_tr]:border-b", className)}
      {...props}
    />
  );
}

function TableBody({ className, ...props }: React.ComponentProps<"tbody">) {
  return (
    <tbody
      data-slot="table-body"
      className={cn("[&_tr:last-child]:border-0", className)}
      {...props}
    />
  );
}

function TableFooter({ className, ...props }: React.ComponentProps<"tfoot">) {
  return (
    <tfoot
      data-slot="table-footer"
      className={cn(
        "bg-muted/50 border-t font-medium [&>tr]:last:border-b-0",
        className,
      )}
      {...props}
    />
  );
}

function TableRow({ className, ...props }: React.ComponentProps<"tr">) {
  return (
    <tr
      data-slot="table-row"
      className={cn(
        "hover:bg-muted/50 data-[state=selected]:bg-muted border-b transition-colors",
        className,
      )}
      {...props}
    />
  );
}

function TableHead({ className, ...props }: React.ComponentProps<"th">) {
  return (
    <th
      data-slot="table-head"
      className={cn(
        "text-foreground h-10 px-2 text-left align-middle font-medium  [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
        className,
      )}
      {...props}
    />
  );
}

function TableCell({ className, ...props }: React.ComponentProps<"td">) {
  return (
    <td
      data-slot="table-cell"
      className={cn(
        "p-2 align-middle [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
        className,
      )}
      {...props}
    />
  );
}

function TableCaption({
  className,
  ...props
}: React.ComponentProps<"caption">) {
  return (
    <caption
      data-slot="table-caption"
      className={cn("text-muted-foreground mt-4 text-sm", className)}
      {...props}
    />
  );
}

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  searchable?: boolean;
  searchPlaceholder?: string;
  searchColumnKey?: string;
  globalSearch?: boolean;
  pagination?: boolean;
  pageSize?: number;
  pageSizeOptions?: number[];
  columnVisibility?: boolean;
  enableAnimations?: boolean;
  staggerDelay?: number;
  className?: string;
  tableClassName?: string;
  headerClassName?: string;
  rowClassName?: string;
  cellClassName?: string;
  showToolbar?: boolean;
  toolbarClassName?: string;
  customToolbar?: React.ReactNode;
  emptyMessage?: string;
  onRowClick?: (row: TData) => void;
  onRowSelect?: (selectedRows: TData[]) => void;
  initialSorting?: SortingState;
  initialColumnFilters?: ColumnFiltersState;
  initialColumnVisibility?: VisibilityState;
  initialGlobalFilter?: string;
  initialPagination?: PaginationState;
  enableScroll?: boolean;
  scrollHeight?: string | number;
  stickyHeader?: boolean;
  showFilters?: boolean;
  showPageSizeSelector?: boolean;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  totalCount?: number;
}

function DataTable<TData, TValue>({
  columns,
  data,
  searchable = true,
  searchPlaceholder = "Search...",
  globalSearch = true,
  pagination = true,
  pageSize = 5,
  pageSizeOptions = [5, 10, 20, 30, 40, 50],
  columnVisibility = true,
  enableAnimations = true,
  staggerDelay = 0.05,
  className,
  tableClassName,
  rowClassName,
  cellClassName,
  showToolbar = true,
  toolbarClassName,
  customToolbar,
  emptyMessage = "No results found.",
  onRowClick,
  onRowSelect,
  initialSorting = [],
  initialColumnFilters = [],
  initialColumnVisibility = {},
  initialGlobalFilter = "",
  initialPagination = { pageIndex: 0, pageSize },
  enableScroll = false,
  scrollHeight = "400px",
  showFilters = false,
  showPageSizeSelector = true,
  onPageChange,
  onPageSizeChange,
  totalCount,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>(initialSorting);
  const [columnFilters, setColumnFilters] =
    React.useState<ColumnFiltersState>(initialColumnFilters);
  const [columnVisibilityState, setColumnVisibilityState] =
    React.useState<VisibilityState>(initialColumnVisibility);
  const [globalFilter, setGlobalFilter] = React.useState(initialGlobalFilter);
  const [paginationState, setPaginationState] =
    React.useState<PaginationState>(initialPagination);
  const [rowSelection, setRowSelection] = React.useState({});
  const [showFiltersPanel, setShowFiltersPanel] = React.useState(false);

  const isServerSidePagination = totalCount !== undefined;

  useEffect(() => {
    if (initialPagination) {
      setPaginationState({
        pageIndex: initialPagination.pageIndex,
        pageSize: initialPagination.pageSize,
      });
    }
  }, [initialPagination?.pageIndex, initialPagination?.pageSize]);

  const handlePaginationChange = (updater: unknown) => {
    const newState =
      typeof updater === "function" ? updater(paginationState) : updater;

    const pageSizeChanged = newState.pageSize !== paginationState.pageSize;

    if (pageSizeChanged && onPageSizeChange) {
      onPageSizeChange(newState.pageSize);
    } else if (
      onPageChange &&
      newState.pageIndex !== paginationState.pageIndex
    ) {
      onPageChange(newState.pageIndex + 1);
    }

    setPaginationState(newState);
  };

  const pageCount =
    isServerSidePagination && totalCount
      ? Math.ceil(totalCount / paginationState.pageSize)
      : undefined;

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel:
      pagination && !enableScroll && !isServerSidePagination
        ? getPaginationRowModel()
        : undefined,
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibilityState,
    onGlobalFilterChange: globalSearch ? setGlobalFilter : undefined,
    onPaginationChange:
      pagination && !enableScroll ? handlePaginationChange : undefined,
    onRowSelectionChange: setRowSelection,
    globalFilterFn: "includesString",
    manualPagination: isServerSidePagination,
    pageCount,
    state: {
      sorting,
      columnFilters,
      columnVisibility: columnVisibilityState,
      globalFilter: globalSearch ? globalFilter : undefined,
      pagination: pagination && !enableScroll ? paginationState : undefined,
      rowSelection,
    },
    initialState: {
      pagination: pagination && !enableScroll ? initialPagination : undefined,
    },
  });

  useEffect(() => {
    if (onRowSelect) {
      const selectedRows = table
        .getFilteredSelectedRowModel()
        .rows.map((row) => row.original);
      onRowSelect(selectedRows);
    }
  }, [rowSelection, onRowSelect, table]);

  const TableWrapper = enableAnimations ? motion.div : "div";
  const ToolbarWrapper = enableAnimations ? motion.div : "div";
  const TableContainerWrapper = enableAnimations ? motion.div : "div";
  const PaginationWrapper = enableAnimations ? motion.div : "div";
  const RowWrapper = enableAnimations ? motion.tr : "tr";
  const FilterPanelWrapper = enableAnimations ? motion.div : "div";

  const animationProps = enableAnimations
    ? {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.5 },
      }
    : {};

  const toolbarAnimationProps = enableAnimations
    ? {
        initial: { opacity: 0, y: -10 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.4, delay: 0.1 },
      }
    : {};

  const tableAnimationProps = enableAnimations
    ? {
        initial: { opacity: 0, scale: 0.95 },
        animate: { opacity: 1, scale: 1 },
        transition: { duration: 0.4, delay: 0.2 },
      }
    : {};

  const paginationAnimationProps = enableAnimations
    ? {
        initial: { opacity: 0, y: 10 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.4, delay: 0.3 },
      }
    : {};

  const filterPanelAnimationProps = enableAnimations
    ? {
        initial: { opacity: 0, height: 0 },
        animate: { opacity: 1, height: "auto" },
        exit: { opacity: 0, height: 0 },
        transition: { duration: 0.3 },
      }
    : {};

  return (
    <TableWrapper
      className={cn("w-full space-y-4", className)}
      {...animationProps}
    >
      {showToolbar && (
        <ToolbarWrapper
          className={cn("flex flex-col gap-4", toolbarClassName)}
          {...toolbarAnimationProps}
        >
          {customToolbar ? (
            customToolbar
          ) : (
            <>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full sm:w-auto">
                  {searchable && globalSearch && (
                    <div className="relative w-full sm:w-80">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder={searchPlaceholder}
                        value={globalFilter ?? ""}
                        onChange={(event) =>
                          setGlobalFilter(event.target.value)
                        }
                        className="pl-10"
                      />
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {showFilters && (
                    <Button
                      variant="outline"
                      onClick={() => setShowFiltersPanel(!showFiltersPanel)}
                      className="gap-2"
                    >
                      <Filter className="h-4 w-4" />
                      Filters
                      <ChevronDown
                        className={cn(
                          "h-4 w-4 transition-transform",
                          showFiltersPanel && "rotate-180",
                        )}
                      />
                    </Button>
                  )}

                  {columnVisibility && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="gap-2">
                          <Eye className="h-4 w-4" />
                          View
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-48">
                        {table
                          .getAllColumns()
                          .filter((column) => column.getCanHide())
                          .map((column) => {
                            return (
                              <DropdownMenuCheckboxItem
                                key={column.id}
                                className="capitalize"
                                checked={column.getIsVisible()}
                                onCheckedChange={(value: boolean) =>
                                  column.toggleVisibility(!!value)
                                }
                              >
                                {column.id}
                              </DropdownMenuCheckboxItem>
                            );
                          })}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </div>

              {showFilters && enableAnimations && (
                <AnimatePresence>
                  {showFiltersPanel && (
                    <FilterPanelWrapper
                      className="border rounded-lg p-4 bg-muted/10"
                      {...filterPanelAnimationProps}
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {table
                          .getAllColumns()
                          .filter((column) => column.getCanFilter())
                          .map((column) => (
                            <div key={column.id} className="space-y-2">
                              <label className="text-sm font-medium capitalize">
                                {column.id}
                              </label>
                              <Input
                                placeholder={`Filter ${column.id}...`}
                                value={
                                  (column.getFilterValue() as string) ?? ""
                                }
                                onChange={(event) =>
                                  column.setFilterValue(event.target.value)
                                }
                              />
                            </div>
                          ))}
                      </div>
                    </FilterPanelWrapper>
                  )}
                </AnimatePresence>
              )}

              {showFilters && !enableAnimations && showFiltersPanel && (
                <div className="border rounded-lg p-4 bg-muted/10">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {table
                      .getAllColumns()
                      .filter((column) => column.getCanFilter())
                      .map((column) => (
                        <div key={column.id} className="space-y-2">
                          <label className="text-sm font-medium capitalize">
                            {column.id}
                          </label>
                          <Input
                            placeholder={`Filter ${column.id}...`}
                            value={(column.getFilterValue() as string) ?? ""}
                            onChange={(event) =>
                              column.setFilterValue(event.target.value)
                            }
                          />
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </>
          )}
        </ToolbarWrapper>
      )}

      <div className="overflow-x-auto">
        <div
          className="overflow-y-auto"
          style={{ maxHeight: enableScroll ? scrollHeight : "auto" }}
        >
          <Table className={tableClassName}>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className="sticky top-0 z-20 bg-card whitespace-nowrap"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>

            <TableBody>
              {table.getRowModel().rows.length ? (
                table.getRowModel().rows.map((row, index) => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="whitespace-nowrap">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    {emptyMessage}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {pagination && !enableScroll && (
        <PaginationWrapper
          className="flex flex-col sm:flex-row items-center justify-between gap-4"
          {...paginationAnimationProps}
        >
          <div className="flex items-center gap-4">
            {showPageSizeSelector && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  Rows per page:
                </span>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-20 justify-between">
                      {table.getState().pagination.pageSize}
                      <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent className="w-28">
                    {pageSizeOptions.map((size) => (
                      <DropdownMenuCheckboxItem
                        key={size}
                        checked={table.getState().pagination.pageSize === size}
                        onCheckedChange={() => table.setPageSize(size)}
                      >
                        {size}
                      </DropdownMenuCheckboxItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <p className="text-sm text-muted-foreground">
              Page {table.getState().pagination.pageIndex + 1} of{" "}
              {table.getPageCount()}
            </p>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                className="h-8 w-8 p-0"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                className="h-8 w-8 p-0"
              >
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </PaginationWrapper>
      )}
    </TableWrapper>
  );
}

const createSortableHeader = <TData, TValue = unknown>(
  title: string,
  enableAnimations: boolean = true,
) => {
  const SortableHeader: React.FC<{ column: Column<TData, TValue> }> = ({
    column,
  }) => {
    const SortButton = enableAnimations ? motion.div : "div";

    return (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="hover:bg-transparent p-0 h-auto"
      >
        {title}
        {enableAnimations ? (
          <SortButton
            animate={{ rotate: column.getIsSorted() === "desc" ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            {column.getIsSorted() ? (
              <ChevronUp className="ml-2 h-4 w-4" />
            ) : (
              <ChevronDown className="ml-2 h-4 w-4" />
            )}
          </SortButton>
        ) : (
          <>
            {column.getIsSorted() ? (
              <ChevronUp className="ml-2 h-4 w-4" />
            ) : (
              <ChevronDown className="ml-2 h-4 w-4" />
            )}
          </>
        )}
      </Button>
    );
  };

  SortableHeader.displayName = "SortableHeader";
  return SortableHeader;
};

interface AnimatedCellProps {
  row: Row<unknown>;
  getValue: () => unknown;
}

const createAnimatedCell = (
  enableAnimations: boolean = true,
  delay: number = 0,
  className?: string,
) => {
  const AnimatedCell: React.FC<AnimatedCellProps> = ({ row, getValue }) => {
    const CellWrapper = enableAnimations ? motion.div : "div";
    const animationProps = enableAnimations
      ? {
          initial: { opacity: 0, x: -20 },
          animate: { opacity: 1, x: 0 },
          transition: { duration: 0.3, delay: row.index * 0.05 + delay },
        }
      : {};

    return (
      <CellWrapper className={className} {...animationProps}>
        {getValue() as React.ReactNode}
      </CellWrapper>
    );
  };

  AnimatedCell.displayName = "AnimatedCell";
  return AnimatedCell;
};

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
  DataTable,
  createSortableHeader,
  createAnimatedCell,
};

export type { ColumnDef } from "@tanstack/react-table";
