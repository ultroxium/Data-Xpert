'use client';

import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import axios from 'axios';
import { useProcessStoreNew } from '@/store/pre-processing';

//get distributions
export const fetchDistributions = async (workspaceId: string, datasetId: string) => {
  const response = await axios.get(
    `/datasets/api/${workspaceId}/${datasetId}/preprocess?type=distributions`,
  );
  return response.data;
};

//get correlation
export const fetchCorrelation = async (workspaceId: string, datasetId: string) => {
  const response = await axios.get(
    `/datasets/api/${workspaceId}/${datasetId}/preprocess?type=correlation`,
  );
  return response.data;
};

//get back to original
export const revertToOriginal = async (workspaceId: string, datasetId: string) => {
  const response = await axios.get(
    `/datasets/api/${workspaceId}/${datasetId}/preprocess?type=revert`,
  );
  return response.data;
};

//clean data
export const cleanData = async (workspaceId: string, datasetId: string, config: any) => {
  const response = await axios.post(
    `/datasets/api/${workspaceId}/${datasetId}/preprocess?type=clean`,
    config,
  );
  return response.data;
};

//encode
export const encodeData = async (workspaceId: string, datasetId: string, config: any) => {
  const response = await axios.post(
    `/datasets/api/${workspaceId}/${datasetId}/preprocess?type=encode`,
    config,
  );
  return response.data;
};

//outliers
export const handleOutliers = async (workspaceId: string, datasetId: string, config: any) => {
  const response = await axios.post(
    `/datasets/api/${workspaceId}/${datasetId}/preprocess?type=outliers`,
    config,
  );
  return response.data;
};

//normalize
export const normalizeData = async (workspaceId: string, datasetId: string, config: any) => {
  const response = await axios.post(
    `/datasets/api/${workspaceId}/${datasetId}/preprocess?type=scale`,
    config,
  );
  return response.data;
};

//auto process
export const autoProcess = async (workspaceId: string, datasetId: string) => {
  const response = await axios.post(
    `/datasets/api/${workspaceId}/${datasetId}/preprocess?type=auto`,{}
  );
  return response.data;
};

//is already trained
export const isAlreadyTrained = async (workspaceId: string, datasetId: string) => {
  const response = await axios.get(
    `/datasets/api/${workspaceId}/${datasetId}/preprocess?type=is_trained`,
  );
  return response.data;
};

export const ProcessedData = ({
  workspaceId,
  datasetId,
}: {
  workspaceId: string;
  datasetId: string;
}) => {
  const { setDistributions, setDistributionsLoading,setCorrelation,setCorrelationLoading, setIsTrained ,setIsTrainedLoading} = useProcessStoreNew();

  // distribution data
  const {
    data: Distributions,
    isLoading: DistributionsLoading,
    error: distributionError,
  } = useQuery({
    queryKey: ['distributions', workspaceId, datasetId],
    queryFn: () => fetchDistributions(workspaceId, datasetId),
  });

  useEffect(() => {
    setDistributionsLoading(DistributionsLoading);
    if (Distributions) {
      setDistributions(Distributions);
    }
  }, [DistributionsLoading, setDistributionsLoading, setDistributions, Distributions]);

  // correlation data
  const {
    data: Correlation,
    isLoading: CorrelationLoading,
    error: correlationError,
  } = useQuery({
    queryKey: ['correlation', workspaceId, datasetId],
    queryFn: () => fetchCorrelation(workspaceId, datasetId),
  });

  useEffect(() => {
    setCorrelationLoading(CorrelationLoading);
    if (Correlation) {
      setCorrelation(Correlation);
    }
  }, [CorrelationLoading, setCorrelationLoading, setCorrelation, Correlation]);


  // is trained data
  const {
    data: isTrainedData,
    isLoading: isTrainedLoading,
    error: isTrainedError,
  } = useQuery({
    queryKey: ['is_trained', workspaceId, datasetId],
    queryFn: () => isAlreadyTrained(workspaceId, datasetId),
  });  

  useEffect(() => {
    setIsTrainedLoading(isTrainedLoading);
    if (isTrainedData) {
      setIsTrained(isTrainedData.STATUS==="TRAINED");
    }
  }, [isTrainedLoading, setIsTrainedLoading, setIsTrained, isTrainedData]);

  return null;
};
