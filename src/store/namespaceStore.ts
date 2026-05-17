import { getErrorMessage } from '@/lib/utils';
import { create } from 'zustand';
import { namespaceApi } from '@/lib/api';
import type { Namespace, CreateNamespaceRequest } from '@/lib/types';

interface NamespaceState {
    namespaces: Namespace[];
    currentNamespace: string;
    listLoading: boolean;
    actionLoading: boolean;
    error: string | null;

    setCurrentNamespace: (namespace: string) => void;
    fetchNamespaces: () => Promise<void>;
    createNamespace: (request: CreateNamespaceRequest) => Promise<void>;
    deleteNamespace: (name: string) => Promise<void>;
}

export const useNamespaceStore = create<NamespaceState>((set, get) => ({
    namespaces: [],
    currentNamespace: 'default',
    listLoading: false,
    actionLoading: false,
    error: null,

    setCurrentNamespace: (namespace: string) => set({ currentNamespace: namespace }),

    fetchNamespaces: async () => {
        set({ listLoading: true, error: null });
        try {
            const data = await namespaceApi.list();
            set({ namespaces: data, listLoading: false });
        } catch (err: unknown) {
            set({ error: getErrorMessage(err) || '获取命名空间列表失败', listLoading: false });
        }
    },

    createNamespace: async (request: CreateNamespaceRequest) => {
        set({ actionLoading: true });
        try {
            await namespaceApi.create(request);
            set({ actionLoading: false });
            get().fetchNamespaces();
        } catch (err: unknown) {
            set({ actionLoading: false });
            throw new Error(getErrorMessage(err) || '创建命名空间失败');
        }
    },

    deleteNamespace: async (name: string) => {
        set({ actionLoading: true });
        try {
            await namespaceApi.delete(name);
            set({ actionLoading: false });
            get().fetchNamespaces();
        } catch (err: unknown) {
            set({ actionLoading: false });
            throw new Error(getErrorMessage(err) || '删除命名空间失败');
        }
    },
}));
