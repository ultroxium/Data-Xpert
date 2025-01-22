// src/store/useDatasetStore.ts
import {create} from 'zustand';
import { toast } from 'sonner';
import { request } from '@/config/api-config';

interface DatasetState {
  datasets: any[];
  tableData: any[];
  dataset_name: string;
  column_details: [];
  isNull: string;
  totalNull: string;
  isLoading: boolean;
  isSuccess: boolean;
  isColumnLoading: boolean;
  isColumnSuccess: boolean;
  isTableLoading: boolean;
  isTableSuccess: boolean;
  isDatasetLoading: boolean;
  isDatasetSuccess: boolean;
  TableDatalastWid: null | number;
  TableDatalastId: null | number;
  ColumndetailLastWid: null | number;
  ColumndetaillastId: null | number;

  //data upload
  isDatasetUpLoading: boolean;
  isDatasetUpLoaded: boolean;
}

// Create the Zustand store
const useDatasetStore = create<DatasetState>((set, get) => ({
  datasets: [],
  tableData: [],
  dataset_name: '',
  column_details: [],
  isNull: "",
  totalNull: "",
  isLoading: false,
  isSuccess: false,
  isColumnLoading: false,
  isColumnSuccess: false,
  isTableLoading: false,
  isTableSuccess: false,
  TableDatalastWid: null,
  TableDatalastId: null,
  ColumndetailLastWid: null,
  ColumndetaillastId: null,
  isDatasetLoading: false,
  isDatasetSuccess: false,

  //data upload
  isDatasetUpLoading: false,
  isDatasetUpLoaded: false,

  postDataset: async (name: string, description: string, file: any, workspace_id: number) => {
    set({ isDatasetUpLoading: true, isDatasetUpLoaded: false });

    const formData = new FormData();
    formData.append('name', name);
    formData.append('description', description);
    formData.append('file', file);

    try {
      const response = await request('post', `/dataset/?workspace_id=${workspace_id}`, {
        data: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const NewDataset = response.data;
      set((state) => ({
        datasets: [...state.datasets, NewDataset],
        isDatasetUpLoading: false,
        isDatasetUpLoaded: true,
      }));
      toast.success('Dataset Uploaded successfully.');
    } catch (error: any) {
      const errorMessage = error?.response?.data?.detail || 'Failed to post dataset.';
      set({ isDatasetUpLoading: false, isDatasetUpLoaded: false });
      toast.error(errorMessage);
    }
  },

  getDatasets: async (workspace_id: number) => {
    set({ isDatasetLoading: true, isDatasetSuccess: false });
    try {
      const response = await request('get', '/dataset/', { params: { workspace_id } });
      set({ datasets: response.data, isDatasetLoading: false, isDatasetSuccess: true });
    } catch (error: any) {
      const errorMessage = error?.response?.data?.detail || 'Failed to get datasets.';
      set({ isDatasetLoading: false, isDatasetSuccess: false });
      toast.error(errorMessage);
    }
  },

  getDefaultDatasets: async () => {
    set({ isDatasetLoading: true, isDatasetSuccess: false });
    try {
      const response = await request('get', '/dataset/default');
      set({ datasets: response.data, isDatasetLoading: false, isDatasetSuccess: true });
    } catch (error: any) {
      const errorMessage = error?.response?.data?.detail || 'Failed to get default datasets.';
      set({ isDatasetLoading: false, isDatasetSuccess: false });
      toast.error(errorMessage);
    }
  },

  deleteDataset: async (id: number, wid: number) => {
    set({ isLoading: true, isSuccess: false });
    try {
      await request('delete', `/dataset/${id}?workspace_id=${wid}`);
      set((state) => ({
        datasets: state.datasets.filter((dataset) => dataset.id !== id),
        isLoading: false,
        isSuccess: true,
      }));
      toast.success('Dataset deleted successfully.');
    } catch (error: any) {
      const errorMessage = error?.response?.data?.detail || 'Failed to delete dataset.';
      set({ isLoading: false, isSuccess: false });
      toast.error(errorMessage);
    }
  },

  duplicateDataset: async (wid: number, id: number) => {
    set({ isLoading: true, isSuccess: false });
    try {
      const response = await request(
        'post',
        `/dataset/duplicate?workspace_id=${wid}&dataset_id=${id}`,
      );
      const NewDataset = response.data;
      set((state) => ({
        datasets: [...state.datasets, NewDataset],
        isLoading: false,
        isSuccess: true,
      }));
      toast.success('Dataset duplicated successfully.');
    } catch (error: any) {
      const errorMessage = error?.response?.data?.detail || 'Failed to duplicate dataset.';
      set({ isLoading: false, isSuccess: false });
      toast.error(errorMessage);
    }
  },

  moveDataset: async (id: number, current_wid: number, workspace_id: number) => {
    set({ isLoading: true, isSuccess: false });
    try {
      await request(
        'put',
        `/dataset/move?current_workspace_id=${current_wid}&workspace_id=${workspace_id}&dataset_id=${id}`,
      );
      set((state) => ({
        datasets: state.datasets.filter((dataset) => dataset.id !== id),
        isLoading: false,
        isSuccess: true,
      }));
      toast.success('Dataset moved to new workspace successfully.');
    } catch (error: any) {
      const errorMessage = error?.response?.data?.detail || 'Failed to move dataset.';
      set({ isLoading: false, isSuccess: false });
      toast.error(errorMessage);
    }
  },

  getTableDatas: async (wid: number, id: number) => {
    const { tableData, isTableLoading, isTableSuccess, TableDatalastWid, TableDatalastId } = get();

    if (tableData && isTableSuccess && TableDatalastWid === wid && TableDatalastId === id) {
      return;
    }
    set({
      isTableLoading: true,
      isTableSuccess: false,
      TableDatalastWid: wid,
      TableDatalastId: id,
    });

    try {
      const response = await request('get', `/dataset/data?workspace_id=${wid}&dataset_id=${id}`);
      set({
        tableData: response.data['data'],

        dataset_name: response.data['dataset_name'],
        isNull: response.data['isNull'],
        totalNull: response.data['total_null'],
        isTableLoading: false,
        isTableSuccess: true,
      });
    } catch (error: any) {
      const errorMessage = error?.response?.data?.detail || 'Failed to get datasets data.';
      set({ isTableLoading: false, isTableSuccess: false });
      toast.error(errorMessage);
    }
  },

  getColumnDetais: async (wid: number, id: number, isProcessed: boolean = false) => {
    const { isColumnLoading, isColumnSuccess } = get();

    set({
      isColumnLoading: true,
      isColumnSuccess: false,
    });
    try {
      const response = await request(
        'get',
        `/dataset/column-info?workspace_id=${wid}&dataset_id=${id}&isProcessed=${isProcessed}`,
      );
      set({ column_details: response.data, isColumnLoading: false, isColumnSuccess: true });
    } catch (error: any) {
      const errorMessage = error?.response?.data?.detail || 'Failed to get default datasets.';
      set({ isColumnLoading: false, isColumnSuccess: false });
      toast.error(errorMessage);
    }
  },

  handleMissingValues: async (workspace_id: number, id: number, type: string) => {
    set({ isLoading: true, isSuccess: false });
    try {
      const response = await request(
        'put',
        `/dataset/handle-missing-value?workspace_id=${workspace_id}&dataset_id=${id}&handleType=${type}`,
      );
      set({ isLoading: false, isSuccess: true });
      toast.success('Missing values handled successfully.');
      return true;
    } catch (error: any) {
      const errorMessage = error?.response?.data?.detail || 'Failed to handle missing values.';
      set({ isLoading: false, isSuccess: false });
      toast.error(errorMessage);
      return false;
    }
  },
}));

export default useDatasetStore;
