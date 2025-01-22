
import { create } from 'zustand';

interface ChartState {
  chartData: any;
  isChartDataLoading: boolean;
  setChartData: (data: any) => void;
  setIsChartDataLoading: (loading: boolean) => void;
}

export const useChartsStoreNew = create<ChartState>((set) => ({
  chartData: null,
  isChartDataLoading: false,
  setChartData: (data) => set({ chartData: data }),
  setIsChartDataLoading: (loading: boolean) => set({ isChartDataLoading: loading }),
}));
