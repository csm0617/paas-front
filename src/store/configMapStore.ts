import { getErrorMessage } from '@/lib/utils';
import { create } from 'zustand';
import { configMapApi, K8sConfigMap } from '@/lib/api';
import { useNamespaceStore } from './namespaceStore';

interface ConfigMapState {
  configMaps: K8sConfigMap[];
  listLoading: boolean;
  error: string | null;

  fetchConfigMaps: (namespace?: string) => Promise<void>;
  getConfigMap: (name: string) => Promise<K8sConfigMap>;
  createConfigMap: (configMap: { name: string; data: Record<string, string> }) => Promise<void>;
  updateConfigMap: (name: string, configMap: { data: Record<string, string> }) => Promise<void>;
  deleteConfigMap: (name: string) => Promise<void>;
}

export const useConfigMapStore = create<ConfigMapState>((set, get) => ({
  configMaps: [],
  listLoading: false,
  error: null,

  fetchConfigMaps: async (namespace) => {
    set({ listLoading: true, error: null });
    try {
      const ns = namespace || useNamespaceStore.getState().currentNamespace;
      const data = await configMapApi.list(ns);
      set({ configMaps: data, listLoading: false });
    } catch (err: unknown) {
      set({ error: getErrorMessage(err) || 'Failed to fetch config maps', listLoading: false });
    }
  },

  getConfigMap: async (name: string) => {
    try {
      const namespace = useNamespaceStore.getState().currentNamespace;
      return await configMapApi.get(namespace, name);
    } catch (err: unknown) {
      throw new Error(getErrorMessage(err) || 'Failed to get config map');
    }
  },

  createConfigMap: async (configMap) => {
    try {
      const namespace = useNamespaceStore.getState().currentNamespace;
      await configMapApi.create(namespace, configMap);
      get().fetchConfigMaps();
    } catch (err: unknown) {
      throw new Error(getErrorMessage(err) || 'Failed to create config map');
    }
  },

  updateConfigMap: async (name, configMap) => {
    try {
      const namespace = useNamespaceStore.getState().currentNamespace;
      await configMapApi.update(namespace, name, configMap);
      get().fetchConfigMaps();
    } catch (err: unknown) {
      throw new Error(getErrorMessage(err) || 'Failed to update config map');
    }
  },

  deleteConfigMap: async (name) => {
    try {
      const namespace = useNamespaceStore.getState().currentNamespace;
      await configMapApi.delete(namespace, name);
      get().fetchConfigMaps();
    } catch (err: unknown) {
      throw new Error(getErrorMessage(err) || 'Failed to delete config map');
    }
  },
}));
