import React, { useEffect, useState } from 'react';
import { useNetworkStore } from '@/store/networkStore';
import { useNamespaceStore } from '@/store/namespaceStore';
import ConfirmDialog from '@/components/ConfirmDialog';
import CreateServiceModal from '@/components/CreateServiceModal';
import { K8sService } from '@/lib/api';
import { RefreshCw, FolderTree, AlertCircle, Trash2, Plus, Link as LinkIcon } from 'lucide-react';

export default function ServiceList() {
  const [namespace, setNamespace] = useState<string>('default');
  const { services, loading, error, fetchServices, deleteService } = useNetworkStore();
  const { namespaces, fetchNamespaces } = useNamespaceStore();

  const [confirmDeleteService, setConfirmDeleteService] = useState<K8sService | null>(null);
  const [isCreateServiceOpen, setCreateServiceOpen] = useState(false);

  useEffect(() => {
    fetchNamespaces();
  }, [fetchNamespaces]);

  useEffect(() => {
    fetchServices(namespace);
  }, [fetchServices, namespace]);

  const handleRefresh = () => {
    fetchServices(namespace);
  };

  const handleConfirmDeleteService = async () => {
    if (!confirmDeleteService) return;
    try {
      await deleteService(namespace, confirmDeleteService.name);
      setConfirmDeleteService(null);
    } catch (err: any) {
      alert(err.message || 'Failed to delete service');
    }
  };

  return (
    <div className="h-full flex flex-col space-y-6">
      {/* Top Action Bar */}
      <div className="flex items-center justify-between bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 bg-slate-100 dark:bg-slate-900 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700">
            <FolderTree size={18} className="text-slate-500" />
            <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Namespace</span>
            <select
              value={namespace}
              onChange={(e) => setNamespace(e.target.value)}
              className="bg-transparent border-none text-sm font-bold text-blue-600 dark:text-blue-400 outline-none cursor-pointer"
            >
              {namespaces.length > 0 ? (
                namespaces.map(ns => (
                  <option key={ns.name} value={ns.name}>{ns.name}</option>
                ))
              ) : (
                <>
                  <option value="default">default</option>
                  <option value="kube-system">kube-system</option>
                </>
              )}
            </select>
          </div>
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-700 rounded-xl transition-colors"
            title="Refresh"
          >
            <RefreshCw size={20} className={loading ? 'animate-spin text-blue-500' : ''} />
          </button>
        </div>

        <button
          onClick={() => setCreateServiceOpen(true)}
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 font-medium"
        >
          <Plus size={18} />
          <span>Create Service</span>
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
                <th className="p-4 font-medium">Type</th>
                <th className="p-4 font-medium">Cluster IP</th>
                <th className="p-4 font-medium">External IP</th>
                <th className="p-4 font-medium">Ports</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {loading && services.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    <RefreshCw size={24} className="animate-spin mx-auto text-blue-500 mb-2" />
                    Loading services...
                  </td>
                </tr>
              ) : services.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    No services found in namespace {namespace}.
                  </td>
                </tr>
              ) : (
                services.map((svc) => (
                  <tr key={svc.name} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors group">
                    <td className="p-4 font-mono text-sm text-slate-800 dark:text-slate-200 flex items-center space-x-2">
                      <LinkIcon size={16} className="text-slate-400" />
                      <span>{svc.name}</span>
                    </td>
                    <td className="p-4 text-sm text-slate-600 dark:text-slate-400">{svc.type}</td>
                    <td className="p-4 text-sm text-slate-600 dark:text-slate-400 font-mono">{svc.clusterIP || '-'}</td>
                    <td className="p-4 text-sm text-slate-600 dark:text-slate-400 font-mono">
                      {svc.externalIPs?.join(', ') || '-'}
                    </td>
                    <td className="p-4 text-sm text-slate-600 dark:text-slate-400">
                      {svc.ports?.map(p => `${p.port}:${p.targetPort}/${p.protocol}`).join(', ') || '-'}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => setConfirmDeleteService(svc)}
                          className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                          title="Delete Service"
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
        isOpen={!!confirmDeleteService}
        title="Delete Service"
        message={`Are you sure you want to delete service '${confirmDeleteService?.name}'?`}
        onConfirm={handleConfirmDeleteService}
        onCancel={() => setConfirmDeleteService(null)}
        confirmText="Delete"
        isDestructive={true}
      />

      {isCreateServiceOpen && (
        <CreateServiceModal
          isOpen={isCreateServiceOpen}
          onClose={() => setCreateServiceOpen(false)}
          namespace={namespace}
        />
      )}
    </div>
  );
}
