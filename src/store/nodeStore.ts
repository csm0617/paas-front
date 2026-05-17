import { getErrorMessage } from '@/lib/utils';
import { create } from 'zustand';
import { nodeApi, K8sNode } from '@/lib/api';

interface NodeState {
  nodes: K8sNode[];
  listLoading: boolean;
  error: string | null;

  fetchNodes: () => Promise<void>;
  cordonNode: (name: string) => Promise<void>;
  uncordonNode: (name: string) => Promise<void>;
}

export const useNodeStore = create<NodeState>((set, get) => ({
  nodes: [],
  listLoading: false,
  error: null,

  fetchNodes: async () => {
    set({ listLoading: true, error: null });
    try {
      const data = await nodeApi.list();
      set({ nodes: data || [], listLoading: false });
    } catch (err: unknown) {
      set({ error: getErrorMessage(err) || 'Failed to fetch nodes', listLoading: false });
    }
  },

  cordonNode: async (name: string) => {
    try {
      await nodeApi.cordon(name);
      await get().fetchNodes();
    } catch (err: unknown) {
      throw new Error(getErrorMessage(err) || 'Failed to cordon node');
    }
  },

  uncordonNode: async (name: string) => {
    try {
      await nodeApi.uncordon(name);
      await get().fetchNodes();
    } catch (err: unknown) {
      throw new Error(getErrorMessage(err) || 'Failed to uncordon node');
    }
  },
}));
