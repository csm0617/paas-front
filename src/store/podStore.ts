import { create } from 'zustand';
import { podApi, Pod } from '@/lib/api';

interface PodState {
  pods: Pod[];
  loading: boolean;
  error: string | null;
  fetchPods: (namespace: string, labels?: Record<string, string>) => Promise<void>;
  deletePod: (namespace: string, name: string) => Promise<void>;
}

export const usePodStore = create<PodState>((set) => ({
  pods: [],
  loading: false,
  error: null,
  fetchPods: async (namespace, labels) => {
    set({ loading: true, error: null });
    try {
      const pods = await podApi.list(namespace, labels);
      set({ pods, loading: false });
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },
  deletePod: async (namespace, name) => {
    set({ loading: true, error: null });
    try {
      await podApi.delete(namespace, name);
      set((state) => ({
        pods: state.pods.filter((p) => p.name !== name),
        loading: false,
      }));
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },
}));
