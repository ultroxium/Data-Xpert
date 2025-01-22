'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ColumnDef } from '@tanstack/react-table';
import ReusableDataTable from '@/components/table';
import { useDatasetStoreNew } from '@/store/datasets';
import { fetchDatasetDetails } from '../data-details';

const generateColumns = (data: any[]): ColumnDef<any>[] => {
  if (!data || !data.length) return [];
  return Object.keys(data[0]).map((key) => ({
    accessorKey: key,
    header: key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' '),
    cell: (info: any) => info.getValue(),
  }));
};

const ViewDataTable = ({ workspaceId, datasetId }: { workspaceId: string; datasetId: string }) => {
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');

  const { setDatasetDetails, setIsLoading } = useDatasetStoreNew();

  const {
    data: tableData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['dataset', workspaceId, datasetId, pageIndex, pageSize, searchTerm],
    queryFn: () =>
      fetchDatasetDetails(
        workspaceId,
        datasetId,
        searchTerm,
        pageSize.toString(),
        (pageIndex * pageSize).toString(),
      ),
  });

  useEffect(() => {
    setIsLoading(isLoading);
    if (tableData) {
      setDatasetDetails(tableData);
    }
  }, [isLoading, setIsLoading, setDatasetDetails, tableData]);

  const columns = useMemo(() => generateColumns(tableData?.data || []), [tableData?.data]);

  const handlePageChange = (newPageIndex: number) => {
    setPageIndex(newPageIndex);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setPageIndex(0);
  };

  const handleSearch = (newSearchTerm: string) => {
    setSearchTerm(newSearchTerm);
    setPageIndex(0);
  };

  return (
    <ReusableDataTable
      data={tableData?.data || []}
      columns={columns}
      totalRecords={tableData?.total || 0}
      isLoading={isLoading}
      onPageChange={handlePageChange}
      onPageSizeChange={handlePageSizeChange}
      onSearch={handleSearch}
    />
  );
};

export default ViewDataTable;
