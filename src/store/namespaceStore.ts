import { create } from 'zustand';
import { namespaceApi, Namespace, CreateNamespaceRequest } from '@/lib/api';

interface NamespaceState {
  namespaces: Namespace[];
  currentNamespace: string;
  loading: boolean;
  error: string | null;

  setCurrentNamespace: (namespace: string) => void;
  fetchNamespaces: () => Promise<void>;
  createNamespace: (request: CreateNamespaceRequest) => Promise<void>;
  deleteNamespace: (name: string) => Promise<void>;
}

export const useNamespaceStore = create<NamespaceState>((set, get) => ({
  namespaces: [],
  currentNamespace: 'default',
  loading: false,
  error: null,

  setCurrentNamespace: (namespace: string) => set({ currentNamespace: namespace }),

  fetchNamespaces: async () => {
    set({ loading: true, error: null });
    try {
      const data = await namespaceApi.list();
      set({ namespaces: data, loading: false });
    } catch (err: any) {
      set({ error: err.message || 'Failed to fetch namespaces', loading: false });
    }
  },

  createNamespace: async (request: CreateNamespaceRequest) => {
    try {
      await namespaceApi.create(request);
      get().fetchNamespaces();
    } catch (err: any) {
      throw new Error(err.response?.data?.message || err.message || 'Failed to create namespace');
    }
  },

  deleteNamespace: async (name: string) => {
    try {
      await namespaceApi.delete(name);
      get().fetchNamespaces();
    } catch (err: any) {
      throw new Error(err.response?.data?.message || err.message || 'Failed to delete namespace');
    }
  },
}));
