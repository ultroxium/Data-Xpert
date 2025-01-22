'use client';
import axios from 'axios';

export const fetchDatasetDetails = async (
  workspaceId: string,
  datasetId: string,
  query: string,
  limit: string,
  offset: string,
) => {
  const response = await axios.get(
    `/datasets/api/${workspaceId}/${datasetId}?&query=${query}&limit=${limit}&offset=${offset}`,
  );
  return response.data;
};

