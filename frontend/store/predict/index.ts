import axios from 'axios';
import { toast } from 'sonner';
import { create } from 'zustand';

interface PredictState {
  //prediction
  isPredicting: boolean;
  isPredictingSuccess: boolean;
  prediction: any[];
  predict: (workspaceId: string, datasetId: string, config: any) => void;
}

export const usePredictStoreNew = create<PredictState>((set) => ({
  //prediction
  isPredicting: false,
  isPredictingSuccess: false,
  prediction: [],

  predict: async (workspaceId: string, datasetId: string, config: any) => {
    set({ isPredicting: true, isPredictingSuccess: false });

    try {
      const response = await axios.post(
        `/datasets/api/${workspaceId}/${datasetId}/predict?type=predict`,
        config,
      );
      set({ prediction: response.data, isPredicting: false, isPredictingSuccess: true });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message;
      set({ isPredicting: false, isPredictingSuccess: false });
      toast.error(errorMessage);
    }
  },
}));
