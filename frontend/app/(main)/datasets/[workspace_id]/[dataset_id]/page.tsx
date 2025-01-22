import Main from '@/components/data';

export default async function DatasetPage({
  params,
}: {
  params: { workspace_id: string; dataset_id: string };
}) {
  const { workspace_id, dataset_id } = await params;

  return (
    <main className="w-full h-full flex flex-col">
      <Main workspaceId={workspace_id} datasetId={dataset_id} />
    </main>
  );
}
