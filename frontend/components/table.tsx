
'use client';

import { useEffect, useState } from 'react';
import { ChevronDownIcon } from 'lucide-react';
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ArrowDownUp, ArrowDownWideNarrow, ArrowUpNarrowWide, Search } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TableSkeleton } from '@/components/skeletons/table';

interface ReusableDataTableProps {
  data: any[];
  columns: ColumnDef<any>[];
  totalRecords: number;
  isLoading: boolean;
  onPageChange: (pageIndex: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  onSearch: (searchTerm: string) => void;
}

export default function ReusableDataTable({
  data,
  columns,
  totalRecords,
  isLoading,
  onPageChange,
  onPageSizeChange,
  onSearch,
}: ReusableDataTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [globalFilter, setGlobalFilter] = useState('');
  const [rowSelection, setRowSelection] = useState({});
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const table = useReactTable({
    data,
    columns,
    pageCount: Math.ceil(totalRecords / pageSize),
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination: {
        pageIndex,
        pageSize,
      },
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: true,
    manualFiltering: true,
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(globalFilter);
    }, 300);

    return () => clearTimeout(timer);
  }, [globalFilter, onSearch]);

  const handlePageChange = (newPageIndex: number) => {
    setPageIndex(newPageIndex);
    onPageChange(newPageIndex);
  };

  const handlePageSizeChange = (newPageSize: string) => {
    const size = parseInt(newPageSize, 10);
    setPageSize(size);
    setPageIndex(0);
    onPageSizeChange(size);
  };

  return (
    <div className="w-full">
      <div className="flex md:flex-row items-center py-4 xxs:flex-col gap-4">
        <div className="relative flex items-center flex-1 w-full">
          <Search size={16} className="absolute left-3" />
          <input
            type="text"
            className="pl-10 pr-4 py-1.5 w-full max-w-[350px] border rounded-lg focus:outline-none focus:border-transparent font-normal"
            placeholder="Search..."
            value={globalFilter ?? ''}
            onChange={(event) => setGlobalFilter(event.target.value)}
          />
        </div>
        <div className='flex gap-4 items-center justify-between xxs:w-full md:w-fit'>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="">
              Columns <ChevronDownIcon className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) => column.toggleVisibility(!!value)}>
                    {column.id}
                  </DropdownMenuCheckboxItem>
                );
              })}
          </DropdownMenuContent>
        </DropdownMenu>
        <Select value={pageSize.toString()} onValueChange={handlePageSizeChange}>
          <SelectTrigger className="w-[120px] ml-4">
            <SelectValue placeholder="Select page size" />
          </SelectTrigger>
          <SelectContent>
            {[10, 20, 30, 40, 50].map((size) => (
              <SelectItem key={size} value={size.toString()}>
                {size} per page
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        </div>
      </div>
      <div className="rounded-lg border overflow-x-auto scrollbar-hide">
        <Table className="min-w-full">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="border-none py-3">
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      className="p-3 bg-secondary text-14 w-fit text-nowrap">
                      {header.isPlaceholder ? null : (
                        <div className="flex items-center">
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {header.column.getCanSort() ? (
                            <button onClick={() => header.column.toggleSorting()} className="ml-2">
                              {header.column.getIsSorted() ? (
                                header.column.getIsSorted() === 'desc' ? (
                                  <ArrowDownWideNarrow size={16} />
                                ) : (
                                  <ArrowUpNarrowWide size={16} />
                                )
                              ) : (
                                <ArrowDownUp size={16} />
                              )}
                            </button>
                          ) : null}
                        </div>
                      )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableSkeleton />
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                  className="cursor-pointer">
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={`text-start p-3 text-12 w-fit ${
                        cell.getValue() === null ? 'bg-red-300 dark:bg-red-600/30' : ''
                      }`}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {`${pageIndex * pageSize + 1}-${Math.min(
            (pageIndex + 1) * pageSize,
            totalRecords,
          )} of ${totalRecords} row(s)`}
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(pageIndex - 1)}
            disabled={pageIndex === 0}>
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(pageIndex + 1)}
            disabled={(pageIndex + 1) * pageSize >= totalRecords}>
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
