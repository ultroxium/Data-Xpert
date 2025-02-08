// app/dashboard/page.tsx
'use client';
import SearchParam from '@/lib/search-param';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Suspense, useState } from 'react';
import { toast } from 'sonner';
import { Workspace } from './types';
import Spinner from '@/components/common/spinner';
import DashboardComponent from '@/components/dashboard';
import MobileMessage from '@/components/mobile-screen-warning';

const fetchWorkspaces = async (): Promise<any> => {
  const response = await axios.get('/api/dashboard?type=workspaces');
  return response.data;
};

// fetch individual workspace
const fetchWorkspaceById = async (workspaceId: string): Promise<any> => {
  const response = await axios.get(`/api/dashboard?type=workspace&wid=${workspaceId}`);
  return response.data;
};

// API fetch function for datasets by workspace ID
export const fetchDatasets = async (workspaceId: string): Promise<any> => {
  const response = await axios.get(`/api/dashboard?type=datasets&wid=${workspaceId}`);
  return response.data;
};

export const fetchDefaultDatasets = async (): Promise<any> => {
  const response = await axios.get(`/api/dashboard?type=default`);
  return response.data;
};

const addWorkspace = async (newWorkspace: Workspace): Promise<Workspace> => {
  const response = await axios.post('/api/dashboard?type=workspace', newWorkspace);
  return response.data;
};

// delete datasets
const deleteDataset = async (workspaceId: string, datasetId: string): Promise<any> => {
  const response = await axios.delete(
    `/api/dashboard?type=dataset&wid=${workspaceId}&did=${datasetId}`,
  );
  return response.data;
};

//put dataset
async function moveDataset(did: string, current_wid: string, workspace_id: string) {
  const response = await axios.put(
    `/api/dashboard?type=movedataset&did=${did}&wid=${current_wid}&twid=${workspace_id}`,
  );
  return response.data;
}

export default function Page() {
  const workspaceId = SearchParam('wid');
  const [isRefetching, setIsRefetching] = useState(false);
  const queryClient = useQueryClient();


  const {
    data: workspaceData,
    isLoading: loadingWorkspace,
    error: workspaceError,
    refetch: refetchWorkspace,
    isFetching: isWorkspaceFetching,
  } = useQuery<any>({
    queryKey: ['workspace', workspaceId],
    queryFn: () => {
      if (workspaceId) {
        return fetchWorkspaceById(workspaceId);
      }
      return fetchWorkspaceById('0');
    },
    staleTime: 60000,
    refetchOnWindowFocus: false,
  });

  const {
    data: workspacesData,
    isLoading: loadingWorkspaces,
    error: workspacesError,
    refetch: refetchWorkspaces,
    isFetching: isWorkspacesFetching,
  } = useQuery<any>({
    queryKey: ['workspaces'],
    queryFn: fetchWorkspaces,
    staleTime: 60000,
    refetchOnWindowFocus: false,
  });

  const {
    data: datasetsData,
    isLoading: loadingDatasets,
    error: datasetsError,
    refetch: refetchDatasets,
  } = useQuery({
    queryKey: ['datasets', workspaceId],
    queryFn: () => {
      if (workspaceId) {
        return fetchDatasets(workspaceId);
      }
      return fetchDefaultDatasets();
    },
    staleTime: 60000,
    refetchOnWindowFocus: false,
  });

  const mutation = useMutation({
    mutationFn: addWorkspace,
    onSuccess: () => {
      setIsRefetching(true);
      refetchWorkspaces().then(() => {
        setIsRefetching(false);
      });
      toast.success('Workspace added successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'An unexpected error occurred');
    },
  });

  const deleteDatasetMutation = useMutation({
    mutationFn: ({ workspaceId, datasetId }: { workspaceId: string; datasetId: string }) => {
      return deleteDataset(workspaceId, datasetId);
    },
    onSuccess: () => {
      setIsRefetching(true);
      refetchDatasets().then(() => {
        setIsRefetching(false);
      });
      toast.success('Dataset deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'An unexpected error occurred');
    },
  });

  const moveDatasetMutation = useMutation({
    mutationFn: ({
      datasetId,
      currentWorkspaceId,
      workspaceId,
    }: {
      datasetId: string;
      currentWorkspaceId: string;
      workspaceId: string;
    }) => {
      return moveDataset(datasetId, currentWorkspaceId, workspaceId);
    },
    onSuccess: () => {
      // Invalidate all relevant queries
      queryClient.invalidateQueries({ queryKey: ['datasets'] });
      // Add a small delay before setting isRefetching to false
      setTimeout(() => {
        setIsRefetching(false);
      }, 1000);
      toast.success('Dataset moved successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'An unexpected error occurred');
      setIsRefetching(false);
    },
  });

  if (workspacesError) {
    return <div>Error fetching workspaces: {workspacesError.message}</div>;
  }

  if (workspaceError) {
    return <div>Error fetching workspace: {workspaceError.message}</div>;
  }

  if (datasetsError) {
    return <div>Error fetching datasets: {datasetsError.message}</div>;
  }

  return (
    <>
      {deleteDatasetMutation.isPending && !deleteDatasetMutation.isSuccess && (
        <Spinner/>
      )}

      {moveDatasetMutation.isPending && !moveDatasetMutation.isSuccess && (
        <Spinner/>
      )}

      <Suspense fallback={<Spinner />}>
        <DashboardComponent
          workspacesData={workspacesData}
          workspaceData={workspaceData}
          datasetsData={datasetsData}
          mutation={mutation}
          deleteDatasetMutation={deleteDatasetMutation}
          moveDatasetMutation={moveDatasetMutation}
          loadingWorkspace={loadingWorkspace}
          loadingWorkspaces={loadingWorkspaces}
          loadingDatasets={loadingDatasets}
        />
      </Suspense>

      <MobileMessage />
    </>
  );
}
