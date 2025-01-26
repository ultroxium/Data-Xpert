'use client';
import SharePreviewCharts from '@/components/preview';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';


const fetchPublicCharts = async (workspace_id: string, dataset_id: string) => {
  const response = await axios.get(`/api/preview/${workspace_id}/${dataset_id}`);
  return response.data;
};

export default function SharePreviewPage({ params }: { params: { code: string } }) {
  const { code } = params;

  function decodeIds(encodedString) {
    const decodedString = atob(encodedString);
    const [workspaceId, datasetId] = decodedString.split('/');
    return { workspace_id: workspaceId, dataset_id: datasetId };
  }

  const { workspace_id, dataset_id } = decodeIds(code);

  const { data, isLoading, error } = useQuery({
    queryKey: ['charts', workspace_id, dataset_id], // More specific query key
    queryFn: () => fetchPublicCharts(workspace_id, dataset_id),
    staleTime: 10000,
    refetchOnWindowFocus: false,
    refetchInterval: 5000,
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return (
      <div>Error fetching data: {error instanceof Error ? error.message : 'Unknown error'}</div>
    );
  }

  return (
    <section className='bg-gray-50 w-full min-h-screen dark:bg-slate-800/10'>
      <div className="container">
        <SharePreviewCharts chartsData={data?.charts} />
      </div>
    </section>
  );
}
