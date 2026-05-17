import { create } from 'zustand';
import { podApi, Pod } from '@/lib/api';
import { getErrorMessage } from '@/lib/utils';

interface PodState {
  pods: Pod[];
  listLoading: boolean;
  error: string | null;
  fetchPods: (namespace: string, labels?: Record<string, string>) => Promise<void>;
  deletePod: (namespace: string, name: string) => Promise<void>;
}

export const usePodStore = create<PodState>((set) => ({
  pods: [],
  listLoading: false,
  error: null,
  fetchPods: async (namespace, labels) => {
    set({ listLoading: true, error: null });
    try {
      const pods = await podApi.list(namespace, labels);
      set({ pods, listLoading: false });
    } catch (err: unknown) {
      set({ error: getErrorMessage(err), listLoading: false });
    }
  },
  deletePod: async (namespace, name) => {
    set({ listLoading: true, error: null });
    try {
      await podApi.delete(namespace, name);
      set((state) => ({
        pods: state.pods.filter((p) => p.name !== name),
        listLoading: false,
      }));
    } catch (err: unknown) {
      set({ error: getErrorMessage(err), listLoading: false });
    }
  },
}));
