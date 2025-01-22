'use client';
import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import axios from 'axios';
import { useDatasetStoreNew } from '@/store/datasets';

const fetchColumnDetails = async (workspaceId: string, datasetId: string,isProcessed:string) => {
  const response = await axios.get(
    `/datasets/api/${workspaceId}/${datasetId}/column-info?type=columndetails&wid=${workspaceId}&did=${datasetId}&isProcessed=${isProcessed}`,
  );
  return response.data;
};

export const ColumnDetails = ({ workspaceId, datasetId, isProcessed='false' }: { workspaceId: string; datasetId: string,isProcessed:string }) => {
  const { setColumnDetails, setColumDetailsLoading } = useDatasetStoreNew();

  const { data, isLoading, error } = useQuery({
    queryKey: ['column-details', workspaceId, datasetId],
    queryFn: () => fetchColumnDetails(workspaceId, datasetId,isProcessed),
  });

  useEffect(() => {
    setColumDetailsLoading(isLoading);
    if (data) {
      setColumnDetails(data);
    }
  }, [isLoading, setColumDetailsLoading, setColumnDetails, data]);

  if (error) {
    return <div>Error fetching column details: {error instanceof Error ? error.message : 'Unknown error'}</div>;
  }

  return null;
};
