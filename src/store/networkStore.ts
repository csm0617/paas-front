import { create } from 'zustand';
import { networkApi, K8sService, K8sIngress } from '@/lib/api';

interface NetworkState {
  services: K8sService[];
  ingresses: K8sIngress[];
  loading: boolean;
  error: string | null;
  fetchServices: (namespace: string) => Promise<void>;
  deleteService: (namespace: string, name: string) => Promise<void>;
  fetchIngresses: (namespace: string) => Promise<void>;
  deleteIngress: (namespace: string, name: string) => Promise<void>;
}

export const useNetworkStore = create<NetworkState>((set) => ({
  services: [],
  ingresses: [],
  loading: false,
  error: null,
  
  fetchServices: async (namespace) => {
    set({ loading: true, error: null });
    try {
      const services = await networkApi.listServices(namespace);
      set({ services, loading: false });
    } catch (err: any) {
      set({ error: err.message || 'Failed to fetch services', loading: false });
    }
  },
  
  deleteService: async (namespace, name) => {
    set({ loading: true, error: null });
    try {
      await networkApi.deleteService(namespace, name);
      set((state) => ({
        services: state.services.filter((s) => s.name !== name),
        loading: false,
      }));
    } catch (err: any) {
      set({ error: err.message || 'Failed to delete service', loading: false });
    }
  },

  fetchIngresses: async (namespace) => {
    set({ loading: true, error: null });
    try {
      const ingresses = await networkApi.listIngresses(namespace);
      set({ ingresses, loading: false });
    } catch (err: any) {
      set({ error: err.message || 'Failed to fetch ingresses', loading: false });
    }
  },
  
  deleteIngress: async (namespace, name) => {
    set({ loading: true, error: null });
    try {
      await networkApi.deleteIngress(namespace, name);
      set((state) => ({
        ingresses: state.ingresses.filter((i) => i.name !== name),
        loading: false,
      }));
    } catch (err: any) {
      set({ error: err.message || 'Failed to delete ingress', loading: false });
    }
  },
}));
