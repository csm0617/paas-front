import React, { useEffect, useState } from 'react';
import { usePodStore } from '@/store/podStore';
import { useNamespaceStore } from '@/store/namespaceStore';
import LogsDrawer from '@/components/LogsDrawer';
import TerminalDrawer from '@/components/TerminalDrawer';
import ConfirmDialog from '@/components/ConfirmDialog';
import { Pod } from '@/lib/api';
import { RefreshCw, FolderTree, AlertCircle, Trash2, FileText, TerminalSquare } from 'lucide-react';

export default function PodList() {
  const [namespace, setNamespace] = useState<string>('default');
  const { pods, loading, error, fetchPods, deletePod } = usePodStore();
  const { namespaces, fetchNamespaces } = useNamespaceStore();

  const [logsPod, setLogsPod] = useState<Pod | null>(null);
  const [terminalPod, setTerminalPod] = useState<Pod | null>(null);
  const [confirmDeletePod, setConfirmDeletePod] = useState<Pod | null>(null);

  useEffect(() => {
    fetchNamespaces();
  }, [fetchNamespaces]);

  useEffect(() => {
    fetchPods(namespace);
  }, [fetchPods, namespace]);

  const handleDeleteClick = (pod: Pod) => {
    setConfirmDeletePod(pod);
  };

  const handleConfirmDelete = async () => {
    if (!confirmDeletePod) return;
    try {
      await deletePod(confirmDeletePod.namespace, confirmDeletePod.name);
    } catch (err: any) {
      alert(err.message || 'Failed to delete pod');
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
            onClick={() => fetchPods(namespace)}
            disabled={loading}
            className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-700 rounded-xl transition-colors"
            title="Refresh"
          >
            <RefreshCw size={20} className={loading ? 'animate-spin text-blue-500' : ''} />
          </button>
        </div>
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
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">Restarts</th>
                <th className="p-4 font-medium">IP</th>
                <th className="p-4 font-medium">Node</th>
                <th className="p-4 font-medium">Age</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {loading && pods.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    <RefreshCw size={24} className="animate-spin mx-auto text-blue-500 mb-2" />
                    Loading pods...
                  </td>
                </tr>
              ) : pods.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    No pods found in namespace {namespace}.
                  </td>
                </tr>
              ) : (
                pods.map((pod) => (
                  <tr key={pod.name} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors group">
                    <td className="p-4 font-mono text-sm text-slate-800 dark:text-slate-200">
                      {pod.name}
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        pod.status === 'Running' 
                          ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400'
                          : 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400'
                      }`}>
                        {pod.status}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-slate-600 dark:text-slate-400">{pod.restarts}</td>
                    <td className="p-4 text-sm text-slate-600 dark:text-slate-400 font-mono">{pod.podIP || '-'}</td>
                    <td className="p-4 text-sm text-slate-600 dark:text-slate-400">{pod.nodeName || '-'}</td>
                    <td className="p-4 text-sm text-slate-600 dark:text-slate-400">
                      {new Date(pod.startTime).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => setLogsPod(pod)}
                          className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                          title="View Logs"
                        >
                          <FileText size={18} />
                        </button>
                        <button
                          onClick={() => setTerminalPod(pod)}
                          className="p-2 text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-colors"
                          title="Terminal"
                        >
                          <TerminalSquare size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(pod)}
                          className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                          title="Delete Pod"
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

      <LogsDrawer
        pod={logsPod}
        onClose={() => setLogsPod(null)}
      />
      <TerminalDrawer
        pod={terminalPod}
        onClose={() => setTerminalPod(null)}
      />
      <ConfirmDialog
        isOpen={!!confirmDeletePod}
        title="Delete Pod"
        message={`Are you sure you want to delete pod '${confirmDeletePod?.name}'?`}
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmDeletePod(null)}
        confirmText="Delete"
        isDestructive={true}
      />
    </div>
  );
}
