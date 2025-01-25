import WorkspaceSwitcher from './workspace-form'
import FileUploadProgress from './file-upload-progress'
import axios from 'axios';
import { useQuery } from '@tanstack/react-query';

const fetchFileUploadProgress = async (workspaceId: string | null): Promise<any> => {
    const response = await axios.get(`/api/dashboard?type=fileuploadprogress&wid=${workspaceId}`);
    return response.data;
  };

export function WorkspaceSidebar({
    loadingWorkspaces,
    loadingWorkspace,
    workspacesData,
    mutation,
    workspaceData,
    me,
    widNo,
    workspaceName,
}: any) {

    const {
        data: fileUploadProgressData,
        isLoading: loadingFileUploadProgress,
        error: fileUploadProgressError,
        refetch: refetchFileUploadProgress,
        isFetching: isFileUploadProgressFetching,
      } = useQuery<any>({
        queryKey: ['fileUploadProgress', widNo],
        queryFn: () => {
          if (widNo) {
            return fetchFileUploadProgress(widNo);
          }
          return fetchFileUploadProgress("0");
        },
        staleTime: 60000,
        refetchOnWindowFocus: false,
      });

    return (
        <aside className='h-[calc(100vh-4rem)] w-[20rem] bg-gray-50 flex flex-col justify-between py-8 px-4 border-r dark:bg-gray-800/20'>
            <WorkspaceSwitcher
                loadingWorkspaces={loadingWorkspaces}
                loadingWorkspace={loadingWorkspace}
                workspacesData={workspacesData}
                mutation={mutation}
                workspaceData={workspaceData}
            />

            <div className='flex flex-col gap-4'>
                <FileUploadProgress uploadedFiles={fileUploadProgressData?.current_datasets} totalFiles={fileUploadProgressData?.total_datasets || 10} isLoading = {loadingFileUploadProgress}/>
                <span>Version 1.0.0</span>
            </div>
        </aside>
    )
}

