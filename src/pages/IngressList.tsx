import { getErrorMessage } from '@/lib/utils';
import React, { useEffect, useState } from 'react';
import { useNetworkStore } from '@/store/networkStore';
import { useNamespaceStore } from '@/store/namespaceStore';
import ConfirmDialog from '@/components/ConfirmDialog';
import CreateIngressModal from '@/components/CreateIngressModal';
import NamespaceSelector from '@/components/NamespaceSelector';
import type { K8sIngress } from '@/lib/types';
import { RefreshCw, AlertCircle, Trash2, Plus, Globe } from 'lucide-react';
import { useToast } from '@/components/Toast';

export default function IngressList() {
  const [namespace, setNamespace] = useState<string>('default');
  const { ingresses, listLoading, error, fetchIngresses, deleteIngress } = useNetworkStore();
  const { namespaces, fetchNamespaces } = useNamespaceStore();
  const toast = useToast();

  const [confirmDeleteIngress, setConfirmDeleteIngress] = useState<K8sIngress | null>(null);
  const [isCreateIngressOpen, setCreateIngressOpen] = useState(false);

  useEffect(() => {
    fetchNamespaces();
  }, [fetchNamespaces]);

  useEffect(() => {
    fetchIngresses(namespace);
  }, [fetchIngresses, namespace]);

  const handleRefresh = () => {
    fetchIngresses(namespace);
  };

  const handleConfirmDeleteIngress = async () => {
    if (!confirmDeleteIngress) return;
    try {
      await deleteIngress(namespace, confirmDeleteIngress.name);
      setConfirmDeleteIngress(null);
    } catch (err: unknown) {
      toast.error(getErrorMessage(err) || '删除入口失败');
    }
  };

  return (
    <div className="h-full flex flex-col space-y-6">
      {/* Top Action Bar */}
      <div className="flex items-center justify-between bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
        <div className="flex items-center space-x-4">
          <NamespaceSelector
            currentNamespace={namespace}
            namespaces={namespaces}
            onChange={setNamespace}
          />
          <button
            onClick={handleRefresh}
            disabled={listLoading}
            className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-700 rounded-xl transition-colors"
            title="刷新"
          >
            <RefreshCw size={20} className={listLoading ? 'animate-spin text-blue-500' : ''} />
          </button>
        </div>

        <button
          onClick={() => setCreateIngressOpen(true)}
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 font-medium"
        >
          <Plus size={18} />
          <span>创建入口</span>
        </button>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 p-4 rounded-xl flex items-center space-x-3">
          <AlertCircle size={20} />
          <span className="font-medium">{error}</span>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700 text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <th className="p-4 font-medium">Name</th>
                <th className="p-4 font-medium">Hosts</th>
                <th className="p-4 font-medium">Paths</th>
                <th className="p-4 font-medium">Load Balancers</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {listLoading && ingresses.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500">
                    <RefreshCw size={24} className="animate-spin mx-auto text-blue-500 mb-2" />
                    加载入口中...
                  </td>
                </tr>
              ) : ingresses.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500">
                    命名空间中暂无入口： {namespace}.
                  </td>
                </tr>
              ) : (
                ingresses.map((ing) => (
                  <tr key={ing.name} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors group">
                    <td className="p-4 font-mono text-sm text-slate-800 dark:text-slate-200 flex items-center space-x-2">
                      <Globe size={16} className="text-slate-400" />
                      <span>{ing.name}</span>
                    </td>
                    <td className="p-4 text-sm text-slate-600 dark:text-slate-400 font-mono">
                      {ing.hosts?.join(', ') || '*'}
                    </td>
                    <td className="p-4 text-sm text-slate-600 dark:text-slate-400 font-mono">
                      {ing.paths?.join(', ') || '-'}
                    </td>
                    <td className="p-4 text-sm text-slate-600 dark:text-slate-400 font-mono">
                      {ing.loadBalancerIPs?.join(', ') || '-'}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => setConfirmDeleteIngress(ing)}
                          className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                          title="删除入口"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmDialog
        isOpen={!!confirmDeleteIngress}
        title="删除入口"
        message={`Are you sure you want to delete ingress '${confirmDeleteIngress?.name}'?`}
        onConfirm={handleConfirmDeleteIngress}
        onCancel={() => setConfirmDeleteIngress(null)}
        confirmText="Delete"
        isDestructive={true}
      />

      {isCreateIngressOpen && (
        <CreateIngressModal
          isOpen={isCreateIngressOpen}
          onClose={() => setCreateIngressOpen(false)}
          namespace={namespace}
        />
      )}
    </div>
  );
}
