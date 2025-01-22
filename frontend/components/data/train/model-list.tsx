'use client';

import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import axios from 'axios';
import { useTrainStoreNew } from '@/store/train';
import SearchParam from '@/lib/search-param';


export const fetchModelList = async (workspaceId: string, datasetId: string, isbasic: string) => {
  const response = await axios.get(
    `/datasets/api/${workspaceId}/${datasetId}/train?type=modelLists&isbasic=${isbasic}`,
  );
  return response.data;
};

export const TrainedModelData = async (workspaceId: string, datasetId: string) => {
  const response = await axios.get(`/datasets/api/${workspaceId}/${datasetId}/train?type=model`);
  return response.data;
};

export const trainModel = async (
  workspaceId: string,
  datasetId: string,
  type: string,
  config: any,
) => {
  const response = await axios.post(
    `/datasets/api/${workspaceId}/${datasetId}/train?type=train&alg=${type}`,
    config,
  );
  return response.data;
};

//automl
export const trainAutoML = async (workspaceId: string, datasetId: string,problem_type:string, config: any) => {
  const response = await axios.post(
    `/datasets/api/${workspaceId}/${datasetId}/train?type=automl&problem_type=${problem_type}`,
    config,
  );
  return response.data;
};

export const deleteModel = async (workspaceId: string, datasetId: string, modelId: string) => {
  const response = await axios.delete(
    `/datasets/api/${workspaceId}/${datasetId}/train?type=model&model_id=${modelId}`,
  );
  return response.data;
};

export const ModelLists = ({
  workspaceId,
  datasetId,
}: {
  workspaceId: string;
  datasetId: string;
}) => {
  const isbasic = SearchParam('isbasic') || 'true';

  const { setModelList, setModelListLoading } = useTrainStoreNew();

  const {
    data: modelList,
    isLoading: isModelListLoading,
    error,
  } = useQuery({
    queryKey: ['model-list', workspaceId, datasetId],
    queryFn: () => fetchModelList(workspaceId, datasetId, isbasic),
  });

  useEffect(() => {
    setModelListLoading(isModelListLoading);
    if (modelList) {
      setModelList(modelList);
    }
  }, [isModelListLoading, setModelListLoading, setModelList, modelList]);

  if (error) {
    return (
      <div>
        Error fetching model list data: {error instanceof Error ? error.message : 'Unknown error'}
      </div>
    );
  }

  return null;
};
