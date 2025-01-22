'use client';

import axios from 'axios';

// Fetch input columns from the API
export const fetchInputColumns = async (workspaceId: string, datasetId: string) => {
  const response = await axios.get(
    `/datasets/api/${workspaceId}/${datasetId}/predict?type=inputColumns`,
  );
  return response.data;
};

// predict
export const predict = async (workspaceId: string, datasetId: string, config: any) => {
  const response = await axios.post(
    `/datasets/api/${workspaceId}/${datasetId}/predict?type=predict`,
    config,
  );
  return response.data;
};