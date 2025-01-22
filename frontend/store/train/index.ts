import { create } from 'zustand';

interface DataTrainState {
    ModelList: any;
    isModelListLoading: boolean;
    setModelList : (data: any) => void;
    setModelListLoading: (loading: boolean) => void;
    }


export const useTrainStoreNew = create<DataTrainState>((set) => ({
    ModelList: null,
    isModelListLoading: false,
    setModelList: (data) => set({ ModelList: data }),
    setModelListLoading: (loading: boolean) => set({ isModelListLoading: loading }),
}));