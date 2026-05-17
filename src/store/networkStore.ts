import { getErrorMessage } from '@/lib/utils';
import { create } from 'zustand';
import { networkApi, K8sService, K8sIngress } from '@/lib/api';

interface NetworkState {
  services: K8sService[];
  ingresses: K8sIngress[];
  listLoading: boolean;
  error: string | null;
  fetchServices: (namespace: string) => Promise<void>;
  deleteService: (namespace: string, name: string) => Promise<void>;
  fetchIngresses: (namespace: string) => Promise<void>;
  deleteIngress: (namespace: string, name: string) => Promise<void>;
}

export const useNetworkStore = create<NetworkState>((set) => ({
  services: [],
  ingresses: [],
  listLoading: false,
  error: null,
  
  fetchServices: async (namespace) => {
    set({ listLoading: true, error: null });
    try {
      const services = await networkApi.listServices(namespace);
      set({ services, listLoading: false });
    } catch (err: unknown) {
      set({ error: getErrorMessage(err) || 'Failed to fetch services', listLoading: false });
    }
  },
  
  deleteService: async (namespace, name) => {
    set({ listLoading: true, error: null });
    try {
      await networkApi.deleteService(namespace, name);
      set((state) => ({
        services: state.services.filter((s) => s.name !== name),
        listLoading: false,
      }));
    } catch (err: unknown) {
      set({ error: getErrorMessage(err) || 'Failed to delete service', listLoading: false });
    }
  },

  fetchIngresses: async (namespace) => {
    set({ listLoading: true, error: null });
    try {
      const ingresses = await networkApi.listIngresses(namespace);
      set({ ingresses, listLoading: false });
    } catch (err: unknown) {
      set({ error: getErrorMessage(err) || 'Failed to fetch ingresses', listLoading: false });
    }
  },
  
  deleteIngress: async (namespace, name) => {
    set({ listLoading: true, error: null });
    try {
      await networkApi.deleteIngress(namespace, name);
      set((state) => ({
        ingresses: state.ingresses.filter((i) => i.name !== name),
        listLoading: false,
      }));
    } catch (err: unknown) {
      set({ error: getErrorMessage(err) || 'Failed to delete ingress', listLoading: false });
    }
  },
}));
