import React, { useState } from 'react';
import { CreateIngressCommand, IngressRuleDto } from '@/lib/api';
import { useNetworkStore } from '@/store/networkStore';
import { X, Plus, Trash2 } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  namespace: string;
}

export default function CreateIngressModal({ isOpen, onClose, namespace }: Props) {
  const [loading, setLoading] = useState(false);
  const { fetchIngresses } = useNetworkStore();
  const [name, setName] = useState('');

  const [rules, setRules] = useState<IngressRuleDto[]>([
    { host: '', path: '/', pathType: 'Prefix', serviceName: '', servicePort: 80 }
  ]);

  if (!isOpen) return null;

  const handleRuleChange = (index: number, field: keyof IngressRuleDto, val: any) => {
    const newRules = [...rules];
    newRules[index] = { ...newRules[index], [field]: val };
    setRules(newRules);
  };

  const addRule = () => {
    setRules([...rules, { host: '', path: '/', pathType: 'Prefix', serviceName: '', servicePort: 80 }]);
  };

  const removeRule = (index: number) => {
    const newRules = [...rules];
    newRules.splice(index, 1);
    setRules(newRules);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const command: CreateIngressCommand = {
        name,
        rules,
      };
      
      const { networkApi } = await import('@/lib/api');
      await networkApi.createIngress(namespace, command);
      await fetchIngresses(namespace);
      onClose();
    } catch (err: any) {
      alert(err.message || 'Failed to create ingress.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col border border-slate-200 dark:border-slate-700 animate-in fade-in zoom-in duration-200">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between bg-slate-50 dark:bg-slate-900/50">
          <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100">Create Ingress</h2>
          <button onClick={onClose} className="p-2 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <form id="create-ingress-form" onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Ingress Name</label>
              <input
                required
                type="text"
                placeholder="e.g. my-ingress"
                className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow outline-none"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Routing Rules</label>
                <button
                  type="button"
                  onClick={addRule}
                  className="text-sm flex items-center space-x-1 text-blue-600 hover:text-blue-700 font-medium"
                >
                  <Plus size={16} />
                  <span>Add Rule</span>
                </button>
              </div>
              <div className="space-y-4">
                {rules.length === 0 && (
                  <div className="text-sm text-slate-400 italic text-center py-4 bg-slate-50 dark:bg-slate-900 rounded-lg border border-dashed border-slate-300 dark:border-slate-700">
                    No rules configured. Ingress will not route any traffic.
                  </div>
                )}
                {rules.map((rule, i) => (
                  <div key={i} className="flex items-start space-x-3 bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                    <div className="flex-1 space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-slate-500 mb-1">Host (Optional)</label>
                          <input
                            type="text"
                            placeholder="e.g. api.example.com"
                            className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm outline-none"
                            value={rule.host || ''}
                            onChange={(e) => handleRuleChange(i, 'host', e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-500 mb-1">Path Type</label>
                          <select
                            className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm outline-none"
                            value={rule.pathType || 'Prefix'}
                            onChange={(e) => handleRuleChange(i, 'pathType', e.target.value)}
                          >
                            <option value="Prefix">Prefix</option>
                            <option value="Exact">Exact</option>
                            <option value="ImplementationSpecific">ImplementationSpecific</option>
                          </select>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-slate-500 mb-1">Path</label>
                          <input
                            required
                            type="text"
                            placeholder="e.g. /api"
                            className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm outline-none"
                            value={rule.path}
                            onChange={(e) => handleRuleChange(i, 'path', e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-500 mb-1">Backend Service</label>
                          <input
                            required
                            type="text"
                            placeholder="e.g. my-service"
                            className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm outline-none"
                            value={rule.serviceName}
                            onChange={(e) => handleRuleChange(i, 'serviceName', e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-500 mb-1">Service Port</label>
                          <input
                            required
                            type="number"
                            placeholder="80"
                            className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm outline-none"
                            value={rule.servicePort}
                            onChange={(e) => handleRuleChange(i, 'servicePort', Number(e.target.value))}
                          />
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeRule(i)}
                      className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors mt-6"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

          </form>
        </div>

        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="create-ingress-form"
            disabled={loading}
            className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-sm transition-all"
          >
            {loading ? 'Creating...' : 'Create Ingress'}
          </button>
        </div>
      </div>
    </div>
  );
}