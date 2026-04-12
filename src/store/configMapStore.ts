import { create } from 'zustand';
import { configMapApi, K8sConfigMap } from '@/lib/api';
import { useNamespaceStore } from './namespaceStore';

interface ConfigMapState {
  configMaps: K8sConfigMap[];
  loading: boolean;
  error: string | null;

  fetchConfigMaps: () => Promise<void>;
  getConfigMap: (name: string) => Promise<K8sConfigMap>;
  createConfigMap: (configMap: { name: string; data: Record<string, string> }) => Promise<void>;
  updateConfigMap: (name: string, configMap: { data: Record<string, string> }) => Promise<void>;
  deleteConfigMap: (name: string) => Promise<void>;
}

export const useConfigMapStore = create<ConfigMapState>((set, get) => ({
  configMaps: [],
  loading: false,
  error: null,

  fetchConfigMaps: async () => {
    set({ loading: true, error: null });
    try {
      const namespace = useNamespaceStore.getState().currentNamespace;
      const data = await configMapApi.list(namespace);
      set({ configMaps: data, loading: false });
    } catch (err: any) {
      set({ error: err.message || 'Failed to fetch config maps', loading: false });
    }
  },

  getConfigMap: async (name: string) => {
    try {
      const namespace = useNamespaceStore.getState().currentNamespace;
      return await configMapApi.get(namespace, name);
    } catch (err: any) {
      throw new Error(err.response?.data?.message || err.message || 'Failed to get config map');
    }
  },

  createConfigMap: async (configMap) => {
    try {
      const namespace = useNamespaceStore.getState().currentNamespace;
      await configMapApi.create(namespace, configMap);
      get().fetchConfigMaps();
    } catch (err: any) {
      throw new Error(err.response?.data?.message || err.message || 'Failed to create config map');
    }
  },

  updateConfigMap: async (name, configMap) => {
    try {
      const namespace = useNamespaceStore.getState().currentNamespace;
      await configMapApi.update(namespace, name, configMap);
      get().fetchConfigMaps();
    } catch (err: any) {
      throw new Error(err.response?.data?.message || err.message || 'Failed to update config map');
    }
  },

  deleteConfigMap: async (name) => {
    try {
      const namespace = useNamespaceStore.getState().currentNamespace;
      await configMapApi.delete(namespace, name);
      get().fetchConfigMaps();
    } catch (err: any) {
      throw new Error(err.response?.data?.message || err.message || 'Failed to delete config map');
    }
  },
}));
