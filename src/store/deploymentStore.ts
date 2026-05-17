import { create } from 'zustand';
import { deploymentApi } from '@/lib/api';
import type { K8sDeployment, CreateDeploymentCommand } from '@/lib/types';
import { getErrorMessage } from '@/lib/utils';

interface DeploymentState {
    deployments: K8sDeployment[];
    listLoading: boolean;
    actionLoading: boolean;
    error: string | null;
    fetchDeployments: (namespace: string) => Promise<void>;
    createDeployment: (namespace: string, request: CreateDeploymentCommand) => Promise<void>;
    scaleDeployment: (namespace: string, name: string, replicas: number) => Promise<void>;
    updateDeploymentImage: (namespace: string, name: string, image: string) => Promise<void>;
    restartDeployment: (namespace: string, name: string) => Promise<void>;
    deleteDeployment: (namespace: string, name: string) => Promise<void>;
}

export const useDeploymentStore = create<DeploymentState>((set, get) => ({
    deployments: [],
    listLoading: false,
    actionLoading: false,
    error: null,
    fetchDeployments: async (namespace: string) => {
        set({ listLoading: true, error: null });
        try {
            const deployments = await deploymentApi.list(namespace);
            set({ deployments, listLoading: false });
        } catch (err: unknown) {
            set({ error: getErrorMessage(err), listLoading: false });
        }
    },
    createDeployment: async (namespace: string, request: CreateDeploymentCommand) => {
        set({ actionLoading: true });
        try {
            await deploymentApi.create(namespace, request);
            await get().fetchDeployments(namespace);
        } catch (err: unknown) {
            set({ error: getErrorMessage(err), actionLoading: false });
            throw err;
        }
    },
    scaleDeployment: async (namespace: string, name: string, replicas: number) => {
        set({ actionLoading: true });
        try {
            await deploymentApi.scale(namespace, name, replicas);
            await get().fetchDeployments(namespace);
        } catch (err: unknown) {
            set({ error: getErrorMessage(err), actionLoading: false });
            throw err;
        }
    },
    updateDeploymentImage: async (namespace: string, name: string, image: string) => {
        set({ actionLoading: true });
        try {
            await deploymentApi.updateImage(namespace, name, image);
            await get().fetchDeployments(namespace);
        } catch (err: unknown) {
            set({ error: getErrorMessage(err), actionLoading: false });
            throw err;
        }
    },
    restartDeployment: async (namespace: string, name: string) => {
        set({ actionLoading: true });
        try {
            await deploymentApi.restart(namespace, name);
            await get().fetchDeployments(namespace);
        } catch (err: unknown) {
            set({ error: getErrorMessage(err), actionLoading: false });
            throw err;
        }
    },
    deleteDeployment: async (namespace: string, name: string) => {
        set({ actionLoading: true });
        try {
            await deploymentApi.delete(namespace, name);
            await get().fetchDeployments(namespace);
        } catch (err: unknown) {
            set({ error: getErrorMessage(err), actionLoading: false });
            throw err;
        }
    },
}));
