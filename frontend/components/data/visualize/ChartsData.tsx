'use client';

import { useChartsStoreNew } from '@/store/charts';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useEffect } from 'react';

const fetchCharts = async (workspaceId: string, datasetId: string) => {
  const response = await axios.get(`/datasets/api/${workspaceId}/${datasetId}/charts?type=charts`);
  return response.data;
};

export const ChartsData = ({
  workspaceId,
  datasetId,
}: {
  workspaceId: string;
  datasetId: string;
}) => {
  const { setChartData, setIsChartDataLoading } = useChartsStoreNew();

  const {
    data,
    isLoading,
    error,
    refetch: refetchCharts,
  } = useQuery({
    queryKey: ['charts', workspaceId, datasetId],
    queryFn: () => fetchCharts(workspaceId, datasetId),
  });

  useEffect(() => {
    setIsChartDataLoading(isLoading);
    if (data) {
      setChartData(data);
    }
  }, [isLoading, setIsChartDataLoading, setChartData, data]);

  if (error) {
    return (
      <div>Error fetching charts: {error instanceof Error ? error.message : 'Unknown error'}</div>
    );
  }

  return null;
};
