// src/store/useStore.ts
import {create} from 'zustand';
import { toast } from 'sonner';
import { ApiRoutes } from '@/config/api-routes';
import { request } from '@/config/api-config';

interface State {
  workspace: string;
  workspace_data: any;
  workspaces: any[];
  isLoading: boolean;
  isSuccess: boolean;
  isWorkspacesLoading: boolean;
  isWorkspacesSuccess: boolean;
}

// Create the Zustand store
const useDashboardStore = create<State>((set, get) => ({
  workspace: 'Default Workspace',
  workspace_data: {},
  workspaces: [],
  isLoading: false,
  isSuccess: false,
  isWorkspacesLoading: false,
  isWorkspacesSuccess: false,

  addWorkspace: async (name: string) => {
    set({ isWorkspacesLoading: true, isWorkspacesSuccess: false });
    try {
      const response = await request('post', ApiRoutes.workspace, { data: { name } });
      set((state) => ({
        isWorkspacesLoading: false,
        isWorkspacesSuccess: true,
      }));
      return true;
    } catch (error: any) {
      const errorMessage = error?.response?.data?.detail || 'Failed to add workspace.';
      set({ isWorkspacesLoading: false, isWorkspacesSuccess: false });
      toast.error(errorMessage);
      return false;
    }
  },

  getWorkspaces: async () => {
    set({ isWorkspacesLoading: true, isWorkspacesSuccess: false });
    try {
      const response = await request('get', ApiRoutes.workspace);
      set({ workspaces: response.data, isWorkspacesLoading: false, isWorkspacesSuccess: true });
      return true;
    } catch (error: any) {
      const errorMessage = error?.response?.data?.detail || 'Failed to get workspaces';
      set({ isWorkspacesLoading: false, isWorkspacesSuccess: false });
      toast.error(errorMessage);
      return false;
    }
  },

  getWorkspace: async (workspaceId: number) => {
    // const { workspace_data,workspace, isLoading, isSuccess } = get();

    // if (workspace_data && workspace && isSuccess) {
    //   return;
    // }
    set({ isLoading: true, isSuccess: false });
    try {
      const response = await request('get', `${ApiRoutes.workspace}${workspaceId}`);
      set({
        workspace_data: response.data,
        workspace: response.data?.['name'],
        isLoading: false,
        isSuccess: true,
      });
    } catch (error: any) {
      const errorMessage = error?.response?.data?.detail || 'Failed to get workspaces';
      set({ isLoading: false, isSuccess: false });
      toast.error(errorMessage);
    }
  },

  updateWorkspace: async (workspaceId: number, name: string) => {
    set({ isLoading: true, isSuccess: false });
    try {
      const response = await request('put', `${ApiRoutes.workspace}${workspaceId}`, {
        data: { name },
      });
      const updatedWorkspace = response.data['name'];
      set((state) => ({
        workspace: updatedWorkspace,
        isLoading: false,
        isSuccess: true,
      }));
      toast.success('Workspace updated successfully.');
      return true;
    } catch (error: any) {
      const errorMessage = error?.response?.data?.detail || 'Failed to update workspace.';
      set({ isLoading: false, isSuccess: false });
      toast.error(errorMessage);
      return false;
    }
  },

  deleteWorkspace: async (workspaceId: string) => {
    set({ isWorkspacesLoading: true, isWorkspacesSuccess: false });
    try {
      await request('delete', `${ApiRoutes.workspace}${workspaceId}`);
      set((state) => ({
        workspaces: state.workspaces.filter((workspace) => workspace.id !== workspaceId),
        isWorkspacesLoading: false,
        isWorkspacesSuccess: true,
      }));
      toast.success('Workspace deleted successfully.');
    } catch (error: any) {
      const errorMessage = error?.response?.data?.detail || 'Failed to delete workspace.';
      set({ isWorkspacesLoading: false, isWorkspacesSuccess: false });
      toast.error(errorMessage);
    }
  },
}));

export default useDashboardStore;
