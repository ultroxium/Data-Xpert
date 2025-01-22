// stores/datasetStore.ts
import { create } from 'zustand';

interface DatasetState {
  tableDatasetData: any;
  isTableDatasetLoading: boolean;
  setDatasetDetails: (data: any) => void;
  setIsLoading: (loading: boolean) => void;

  // For Columns details
  columnDetails: any;
  isColumnDetailsLoading: boolean;
  setColumnDetails: (data: any) => void;
  setColumDetailsLoading: (loading: boolean) => void;

  //For Column Insights
  columnInsights: any;
  isColumnInsightsLoading: boolean;
  setColumnInsights: (data: any) => void;
  setColumInsightsLoading: (loading: boolean) => void;
}

export const useDatasetStoreNew = create<DatasetState>((set) => ({
  tableDatasetData: null,
  isTableDatasetLoading: false,
  setDatasetDetails: (data) => set({ tableDatasetData: data }),
  setIsLoading: (loading: boolean) => set({ isTableDatasetLoading: loading }),

  // For Columns details
  columnDetails: null,
  isColumnDetailsLoading: false,
  setColumnDetails: (data) => set({ columnDetails: data }),
  setColumDetailsLoading: (loading: boolean) => set({ isColumnDetailsLoading: loading }),

  //For Column Insights
  columnInsights: null,
  isColumnInsightsLoading: false,
  setColumnInsights: (data) => set({ columnInsights: data }),
  setColumInsightsLoading: (loading: boolean) => set({ isColumnInsightsLoading: loading }),
}));
