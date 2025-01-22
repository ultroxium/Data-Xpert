import { create } from 'zustand';

interface PreProcessState {
    processedData: any;
    isProcessedDataLoading: boolean;
    setProcessedData : (data: any) => void;
    setProcessedDataLoading: (loading: boolean) => void;

    //distributions
    distributionData: any;
    isDistributionsLoading: boolean;
    setDistributions: (data: any) => void;
    setDistributionsLoading: (loading: boolean) => void;

    //correlation
    correlationData: any;
    isCorrelationLoading: boolean;
    setCorrelation: (data: any) => void;
    setCorrelationLoading: (loading: boolean) => void;
    }


export const useProcessStoreNew = create<PreProcessState>((set) => ({
    processedData: null,
    isProcessedDataLoading: false,
    setProcessedData: (data) => set({ processedData: data }),
    setProcessedDataLoading: (loading: boolean) => set({ isProcessedDataLoading: loading }),

    //distributions
    distributionData: null,
    isDistributionsLoading: false,
    setDistributions: (data) => set({ distributionData: data }),
    setDistributionsLoading: (loading: boolean) => set({ isDistributionsLoading: loading }),

    //correlation
    correlationData: null,
    isCorrelationLoading: false,
    setCorrelation: (data) => set({ correlationData: data }),
    setCorrelationLoading: (loading: boolean) => set({ isCorrelationLoading: loading }),
}));