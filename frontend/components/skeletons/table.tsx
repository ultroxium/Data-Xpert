import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export const TableSkeleton = () => {
  return (
    <div className="w-full">
      {/* Table Skeleton */}
      <div className="rounded-md border overflow-x-auto">
        <Table className="min-w-full">
          <TableHeader>
            <TableRow className="border-none py-3">
              {/* Skeletons for Table Headers */}
              {Array.from({ length: 4 }).map((_, index) => (
                <TableHead key={index} className="p-3 bg-secondary text-14 w-fit text-nowrap">
                  <Skeleton className="h-4 w-[150px]" />
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>

          <TableBody>
            {/* Skeleton Rows */}
            {Array.from({ length: 10 }).map((_, rowIndex) => (
              <TableRow key={rowIndex} className="cursor-pointer">
                {Array.from({ length: 4 }).map((_, cellIndex) => (
                  <TableCell key={cellIndex} className="text-start px-3 py-2 text-12 w-fit">
                    <Skeleton className="h-6 w-[250px]" />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
