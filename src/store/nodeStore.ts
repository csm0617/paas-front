import { create } from 'zustand';
import { nodeApi, K8sNode } from '@/lib/api';

interface NodeState {
  nodes: K8sNode[];
  loading: boolean;
  error: string | null;

  fetchNodes: () => Promise<void>;
  cordonNode: (name: string) => Promise<void>;
  uncordonNode: (name: string) => Promise<void>;
}

export const useNodeStore = create<NodeState>((set, get) => ({
  nodes: [],
  loading: false,
  error: null,

  fetchNodes: async () => {
    set({ loading: true, error: null });
    try {
      const data = await nodeApi.list();
      set({ nodes: data || [], loading: false });
    } catch (err: any) {
      set({ error: err.message || 'Failed to fetch nodes', loading: false });
    }
  },

  cordonNode: async (name: string) => {
    try {
      await nodeApi.cordon(name);
      await get().fetchNodes();
    } catch (err: any) {
      throw new Error(err.response?.data?.message || err.message || 'Failed to cordon node');
    }
  },

  uncordonNode: async (name: string) => {
    try {
      await nodeApi.uncordon(name);
      await get().fetchNodes();
    } catch (err: any) {
      throw new Error(err.response?.data?.message || err.message || 'Failed to uncordon node');
    }
  },
}));
