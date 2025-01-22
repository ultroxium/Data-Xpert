'use client';
import SearchParam from '@/lib/search-param';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

const fetchWorkspaceById = async (workspaceId: string): Promise<any> => {
  const response = await axios.get(`/api/dashboard?type=workspace&wid=${workspaceId}`);
  return response.data;
};

export const useWorkspace = () => {
  const workspaceId = SearchParam('wid');
  return useQuery<any>({
    queryKey: ['workspace', workspaceId],
    queryFn: () => {
      if (workspaceId) {
        return fetchWorkspaceById(workspaceId);
      }
      return fetchWorkspaceById('0');
    },
    staleTime: 60000,
    refetchOnWindowFocus: false,
  });;
};
