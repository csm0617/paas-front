import { getErrorMessage } from '@/lib/utils';
import { create } from 'zustand';
import { applicationApi } from '@/lib/api';
import type { Application, DeployCommand } from '@/lib/types';

interface AppState {
    deployments: Application[];
    listLoading: boolean;
    actionLoading: boolean;
    error: string | null;
    fetchDeployments: (namespace: string) => Promise<void>;
    deploy: (namespace: string, command: DeployCommand) => Promise<void>;
    scale: (namespace: string, name: string, serviceName: string, workloadName: string, replicas: number) => Promise<void>;
    updateImage: (namespace: string, name: string, serviceName: string, workloadName: string, image: string) => Promise<void>;
    deleteDeployment: (namespace: string, name: string) => Promise<void>;
    start: (namespace: string, name: string) => Promise<void>;
    stop: (namespace: string, name: string) => Promise<void>;
    restart: (namespace: string, name: string, serviceName: string, workloadName: string) => Promise<void>;
    rollback: (namespace: string, name: string, serviceName: string, workloadName: string) => Promise<void>;
}

let fetchDeploymentsTimeout: ReturnType<typeof setTimeout> | null = null;

export const useAppStore = create<AppState>((set, get) => ({
    deployments: [],
    listLoading: false,
    actionLoading: false,
    error: null,

    fetchDeployments: (namespace: string) => {
        return new Promise<void>((resolve) => {
            if (fetchDeploymentsTimeout) {
                clearTimeout(fetchDeploymentsTimeout);
            }
            fetchDeploymentsTimeout = setTimeout(async () => {
                set({ listLoading: true, error: null });
                try {
                    const data = await applicationApi.getDeployments(namespace);
                    set({ deployments: data, listLoading: false });
                } catch (err: unknown) {
                    set({ error: getErrorMessage(err) || '获取部署列表失败', listLoading: false });
                }
                resolve();
            }, 300);
        });
    },

    deploy: async (namespace: string, command) => {
        set({ actionLoading: true });
        try {
            await applicationApi.deploy(command);
            get().fetchDeployments(namespace);
        } catch (err: unknown) {
            throw new Error(getErrorMessage(err) || '部署失败');
        } finally {
            set({ actionLoading: false });
        }
    },

    scale: async (namespace, name, serviceName, workloadName, replicas) => {
        set({ actionLoading: true });
        try {
            await applicationApi.scaleWorkload(namespace, name, serviceName, workloadName, replicas);
            get().fetchDeployments(namespace);
        } catch (err: unknown) {
            throw new Error(getErrorMessage(err) || '扩缩容失败');
        } finally {
            set({ actionLoading: false });
        }
    },

    updateImage: async (namespace, name, serviceName, workloadName, image) => {
        set({ actionLoading: true });
        try {
            await applicationApi.updateWorkloadImage(namespace, name, serviceName, workloadName, image);
            get().fetchDeployments(namespace);
        } catch (err: unknown) {
            throw new Error(getErrorMessage(err) || '更新镜像失败');
        } finally {
            set({ actionLoading: false });
        }
    },

    deleteDeployment: async (namespace, name) => {
        set({ actionLoading: true });
        try {
            await applicationApi.delete(namespace, name);
            get().fetchDeployments(namespace);
        } catch (err: unknown) {
            throw new Error(getErrorMessage(err) || '删除部署失败');
        } finally {
            set({ actionLoading: false });
        }
    },

    start: async (namespace, name) => {
        set({ actionLoading: true });
        try {
            await applicationApi.start(namespace, name);
            get().fetchDeployments(namespace);
        } catch (err: unknown) {
            throw new Error(getErrorMessage(err) || '启动部署失败');
        } finally {
            set({ actionLoading: false });
        }
    },

    stop: async (namespace, name) => {
        set({ actionLoading: true });
        try {
            await applicationApi.stop(namespace, name);
            get().fetchDeployments(namespace);
        } catch (err: unknown) {
            throw new Error(getErrorMessage(err) || '停止部署失败');
        } finally {
            set({ actionLoading: false });
        }
    },

    restart: async (namespace, name, serviceName, workloadName) => {
        set({ actionLoading: true });
        try {
            await applicationApi.restartWorkload(namespace, name, serviceName, workloadName);
            get().fetchDeployments(namespace);
        } catch (err: unknown) {
            throw new Error(getErrorMessage(err) || '重启部署失败');
        } finally {
            set({ actionLoading: false });
        }
    },

    rollback: async (namespace, name, serviceName, workloadName) => {
        set({ actionLoading: true });
        try {
            await applicationApi.rollbackWorkload(namespace, name, serviceName, workloadName);
            get().fetchDeployments(namespace);
        } catch (err: unknown) {
            throw new Error(getErrorMessage(err) || '回滚部署失败');
        } finally {
            set({ actionLoading: false });
        }
    },
}));
