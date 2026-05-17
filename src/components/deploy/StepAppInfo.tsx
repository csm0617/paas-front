import React from 'react';
import type { FormState } from '@/hooks/useDeployForm';

interface Props {
  formState: FormState;
  setFormState: React.Dispatch<React.SetStateAction<FormState>>;
  namespaceOptions: string[];
  isEdit: boolean;
}

export default function StepAppInfo({ formState, setFormState, namespaceOptions, isEdit }: Props) {
  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">应用名称</label>
          <input
            type="text"
            placeholder="e.g. my-app"
            disabled={isEdit}
            className={`w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg outline-none ${isEdit ? 'bg-slate-200 dark:bg-slate-800 text-slate-500 cursor-not-allowed' : 'bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500'}`}
            value={formState.name}
            onChange={(e) => setFormState({ ...formState, name: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Namespace</label>
          <div className="space-y-2">
            <select
              disabled={isEdit}
              value={formState.namespace || ''}
              onChange={(e) => {
                setFormState({ ...formState, namespace: e.target.value });
              }}
              className={`w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg outline-none ${isEdit ? 'bg-slate-200 dark:bg-slate-800 text-slate-500 cursor-not-allowed' : 'bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500'}`}
            >
              <option value="" disabled>选择命名空间</option>
              {namespaceOptions.map((ns) => (
                <option key={ns} value={ns}>{ns}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">描述</label>
        <textarea
          placeholder="可选描述..."
          rows={3}
          className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          value={formState.description}
          onChange={(e) => setFormState({ ...formState, description: e.target.value })}
        />
      </div>
    </div>
  );
}
