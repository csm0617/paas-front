import React from 'react';
import { FolderTree } from 'lucide-react';
import type { Namespace } from '@/lib/types';

interface NamespaceSelectorProps {
  currentNamespace: string;
  namespaces: Namespace[];
  onChange: (namespace: string) => void;
}

export default function NamespaceSelector({ currentNamespace, namespaces, onChange }: NamespaceSelectorProps) {
  return (
    <div className="flex items-center space-x-2 bg-slate-100 dark:bg-slate-900 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700">
      <FolderTree size={18} className="text-slate-500" />
      <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Namespace</span>
      <select
        value={currentNamespace}
        onChange={(e) => onChange(e.target.value)}
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
  );
}
