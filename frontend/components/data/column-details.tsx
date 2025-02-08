// 'use client';
// import { useQuery } from '@tanstack/react-query';
// import { useEffect } from 'react';
// import axios from 'axios';
// import { useDatasetStoreNew } from '@/store/datasets';

// const fetchColumnDetails = async (workspaceId: string, datasetId: string,isProcessed:string) => {
//   const response = await axios.get(
//     `/datasets/api/${workspaceId}/${datasetId}/column-info?type=columndetails&wid=${workspaceId}&did=${datasetId}&isProcessed=${isProcessed}`,
//   );
//   return response.data;
// };

// export const ColumnDetails = ({ workspaceId, datasetId, isProcessed='false' }: { workspaceId: string; datasetId: string,isProcessed:string }) => {
//   const { setColumnDetails, setColumDetailsLoading } = useDatasetStoreNew();

//   const { data, isLoading, error, refetch } = useQuery({
//     queryKey: ['column-details', workspaceId, datasetId, isProcessed],
//     queryFn: () => fetchColumnDetails(workspaceId, datasetId, isProcessed),
//   });

//   useEffect(() => {
//     setColumDetailsLoading(isLoading);
//     if (data) {
//       setColumnDetails(data);
//     }
//   }, [isLoading, setColumDetailsLoading, setColumnDetails, data]);

//   if (error) {
//     return <div>Error fetching column details: {error instanceof Error ? error.message : 'Unknown error'}</div>;
//   }

//   return null;
// };


'use client';
import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import axios from 'axios';
import { useDatasetStoreNew } from '@/store/datasets';

const fetchColumnDetails = async (workspaceId: string, datasetId: string, isProcessed: string) => {
  const response = await axios.get(
    `/datasets/api/${workspaceId}/${datasetId}/column-info?type=columndetails&wid=${workspaceId}&did=${datasetId}&isProcessed=${isProcessed}`,
  );
  return response.data;
};

export const ColumnDetails = ({ workspaceId, datasetId,isProcessed='false' }: { workspaceId: string; datasetId: string,isProcessed:string }) => {
  const { setColumnDetails, setColumDetailsLoading } = useDatasetStoreNew();

  // Query for isProcessed=false
  const { data: unprocessedData, isLoading: unprocessedLoading, error: unprocessedError } = useQuery({
    queryKey: ['column-details', workspaceId, datasetId, isProcessed==="false"],
    queryFn: () => fetchColumnDetails(workspaceId, datasetId, "false"),
  });

  // Query for isProcessed=true
  const { data: processedData, isLoading: processedLoading, error: processedError } = useQuery({
    queryKey: ['column-details', workspaceId, datasetId, isProcessed==="true"],
    queryFn: () => fetchColumnDetails(workspaceId, datasetId, "true"),
  });

  useEffect(() => {
    setColumDetailsLoading(unprocessedLoading || processedLoading);

    if (unprocessedData || processedData) {
      setColumnDetails({
        processed: processedData || null,
        unprocessed: unprocessedData || null,
      });
    }
  }, [unprocessedLoading, processedLoading, setColumDetailsLoading, setColumnDetails, unprocessedData, processedData]);

  if (unprocessedError || processedError) {
    return (
      <div>
        Error fetching column details:{' '}
        {unprocessedError instanceof Error
          ? unprocessedError.message
          : processedError instanceof Error
          ? processedError.message
          : 'Unknown error'}
      </div>
    );
  }

  return null;
};
