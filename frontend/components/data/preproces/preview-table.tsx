'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ColumnDef } from '@tanstack/react-table';
import axios from 'axios';
import { useProcessStoreNew } from '@/store/pre-processing';
import ReusableDataTable from '@/components/table';

export const fetchProcessedData = async (
  workspaceId: string,
  datasetId: string,
  query: string,
  limit: string,
  offset: string,
) => {
  const response = await axios.get(
    `/datasets/api/${workspaceId}/${datasetId}/preprocess?type=processed&query=${query}&limit=${limit}&offset=${offset}`,
  );
  return response.data;
};

const generateColumns = (data: any[]): ColumnDef<any>[] => {
  if (!data || !data.length) return [];
  return Object.keys(data[0]).map((key) => ({
    accessorKey: key,
    header: key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' '),
    cell: (info: any) => info.getValue(),
  }));
};

const PreviewTable = ({ workspaceId, datasetId }: { workspaceId: string; datasetId: string }) => {
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');

  const { setProcessedData, setProcessedDataLoading } = useProcessStoreNew();

  const {
    data: tableData,
    isLoading: ProcessDataLoading,
    error,
  } = useQuery({
    queryKey: ['processed-data', workspaceId, datasetId, pageIndex, pageSize, searchTerm],
    queryFn: () =>
      fetchProcessedData(
        workspaceId,
        datasetId,
        searchTerm,
        pageSize.toString(),
        (pageIndex * pageSize).toString(),
      ),
  });

  useEffect(() => {
    setProcessedDataLoading(ProcessDataLoading);
    if (tableData) {
      setProcessedData(tableData);
    }
  }, [ProcessDataLoading, setProcessedDataLoading, setProcessedData, tableData]);

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
      isLoading={ProcessDataLoading}
      onPageChange={handlePageChange}
      onPageSizeChange={handlePageSizeChange}
      onSearch={handleSearch}
    />
  );
};

export default PreviewTable;
