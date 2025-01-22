
'use client';

import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import axios from 'axios';
import { useDatasetStoreNew } from '@/store/datasets';

const fetchColumnInsights = async (workspaceId: string, datasetId: string) => {
  const response = await axios.get(`/datasets/api/${workspaceId}/${datasetId}/column-insights`);
  return response.data;
};

export const ColumnInsights = ({ workspaceId, datasetId }: { workspaceId: string; datasetId: string }) => {
  const { setColumnInsights, setColumInsightsLoading } = useDatasetStoreNew();

  const { data, isLoading, error } = useQuery({
    queryKey: ['column-insights', workspaceId, datasetId],
    queryFn: () => fetchColumnInsights(workspaceId, datasetId),
  });

  useEffect(() => {
    setColumInsightsLoading(isLoading);
    if (data) {
      setColumnInsights(data);
    }
  }, [isLoading, setColumInsightsLoading, setColumnInsights, data]);

  if (error) {
    return <div>Error fetching column insights: {error instanceof Error ? error.message : 'Unknown error'}</div>;
  }

  return null;
};
