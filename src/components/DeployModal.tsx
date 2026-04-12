import React, { useState } from 'react';
import { DeployCommand } from '@/lib/api';
import { X, Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onDeploy: (command: DeployCommand) => Promise<void>;
}

export default function DeployModal({ isOpen, onClose, onDeploy }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [formData, setFormData] = useState<DeployCommand>({
    name: '',
    namespace: 'default',
    image: '',
    port: 80,
    replicas: 1,
    maxReplicas: 5,
    env: {},
    targetCpuUtilization: 80,
    targetMemoryUtilization: 80,
    enableService: false,
    serviceType: 'ClusterIP',
    enableIngress: false,
    ingressDomain: '',
  });

  const [envList, setEnvList] = useState<{ key: string; value: string }[]>([]);
  const [configList, setConfigList] = useState<{ key: string; value: string }[]>([]);
  const [secretList, setSecretList] = useState<{ key: string; value: string }[]>([]);

  if (!isOpen) return null;

  const handleListChange = (
    list: { key: string; value: string }[],
    setList: React.Dispatch<React.SetStateAction<{ key: string; value: string }[]>>,
    index: number,
    field: 'key' | 'value',
    val: string
  ) => {
    const newList = [...list];
    newList[index][field] = val;
    setList(newList);
  };

  const addToList = (
    list: { key: string; value: string }[],
    setList: React.Dispatch<React.SetStateAction<{ key: string; value: string }[]>>
  ) => {
    setList([...list, { key: '', value: '' }]);
  };

  const removeFromList = (
    list: { key: string; value: string }[],
    setList: React.Dispatch<React.SetStateAction<{ key: string; value: string }[]>>,
    index: number
  ) => {
    const newList = [...list];
    newList.splice(index, 1);
    setList(newList);
  };

  const toMap = (list: { key: string; value: string }[]) => {
    return list.reduce((acc, curr) => {
      if (curr.key) acc[curr.key] = curr.value;
      return acc;
    }, {} as Record<string, string>);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (formData.enableIngress && !formData.ingressDomain?.trim()) {
      setError('Domain (Host) is required when Ingress is enabled.');
      return;
    }

    setLoading(true);
    try {
      const command: DeployCommand = {
        ...formData,
        env: toMap(envList),
        configs: toMap(configList),
        secrets: toMap(secretList),
        livenessProbe: { path: '/healthz', port: formData.port, initialDelaySeconds: 15, periodSeconds: 10 },
        readinessProbe: { path: '/ready', port: formData.port, initialDelaySeconds: 5, periodSeconds: 10 },
      };
      
      await onDeploy(command);
      onClose();
    } catch (err) {
      setError('Deployment failed. See console.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col border border-slate-200 dark:border-slate-700 animate-in fade-in zoom-in duration-200">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between bg-slate-50 dark:bg-slate-900/50">
          <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100">Deploy New Application</h2>
          <button onClick={onClose} className="p-2 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <form id="deploy-form" onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-600 dark:text-red-400">
                {error}
              </div>
            )}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Application Name</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. my-nginx"
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow outline-none"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Namespace</label>
                <input
                  required
                  type="text"
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow outline-none"
                  value={formData.namespace}
                  onChange={(e) => setFormData({ ...formData, namespace: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Docker Image</label>
              <input
                required
                type="text"
                placeholder="e.g. nginx:latest"
                className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow outline-none font-mono"
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Container Port</label>
                <input
                  required
                  type="number"
                  min="1"
                  max="65535"
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  value={formData.port}
                  onChange={(e) => setFormData({ ...formData, port: Number(e.target.value) })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Replicas</label>
                <input
                  required
                  type="number"
                  min="0"
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  value={formData.replicas}
                  onChange={(e) => setFormData({ ...formData, replicas: Number(e.target.value) })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Max Replicas</label>
                <input
                  required
                  type="number"
                  min={formData.replicas}
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  value={formData.maxReplicas}
                  onChange={(e) => setFormData({ ...formData, maxReplicas: Number(e.target.value) })}
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Environment Variables</label>
                <button
                  type="button"
                  onClick={() => addToList(envList, setEnvList)}
                  className="text-sm flex items-center space-x-1 text-blue-600 hover:text-blue-700 font-medium"
                >
                  <Plus size={16} />
                  <span>Add Variable</span>
                </button>
              </div>
              <div className="space-y-3">
                {envList.length === 0 && (
                  <div className="text-sm text-slate-400 italic text-center py-4 bg-slate-50 dark:bg-slate-900 rounded-lg border border-dashed border-slate-300 dark:border-slate-700">
                    No environment variables configured.
                  </div>
                )}
                {envList.map((env, i) => (
                  <div key={i} className="flex items-center space-x-3">
                    <input
                      type="text"
                      placeholder="KEY"
                      className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-sm outline-none"
                      value={env.key}
                      onChange={(e) => handleListChange(envList, setEnvList, i, 'key', e.target.value)}
                    />
                    <span className="text-slate-400">=</span>
                    <input
                      type="text"
                      placeholder="VALUE"
                      className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-sm outline-none"
                      value={env.value}
                      onChange={(e) => handleListChange(envList, setEnvList, i, 'value', e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => removeFromList(envList, setEnvList, i)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Networking & Access */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
              <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-4">Networking & Access</h3>
              
              <div className="space-y-4">
                {/* Service Toggle */}
                <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                  <div>
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Enable Internal Service</label>
                    <p className="text-xs text-slate-500">Creates a Kubernetes Service to expose the application within the cluster.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer"
                      checked={formData.enableService}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setFormData({ 
                          ...formData, 
                          enableService: checked,
                          enableIngress: checked ? formData.enableIngress : false 
                        });
                      }}
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                {formData.enableService && (
                  <div className="pl-4 border-l-2 border-blue-500 space-y-4 animate-in fade-in slide-in-from-left-2">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Service Type</label>
                      <select
                        value={formData.serviceType}
                        onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })}
                        className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                      >
                        <option value="ClusterIP">ClusterIP (Internal Only)</option>
                        <option value="NodePort">NodePort (Expose on Node IPs)</option>
                      </select>
                    </div>

                    {/* Ingress Toggle */}
                    <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                      <div>
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Enable External Access (Ingress)</label>
                        <p className="text-xs text-slate-500">Expose the application to the internet via a domain name.</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="sr-only peer"
                          checked={formData.enableIngress}
                          onChange={(e) => setFormData({ ...formData, enableIngress: e.target.checked })}
                        />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    {formData.enableIngress && (
                      <div className="pl-4 border-l-2 border-purple-500 animate-in fade-in slide-in-from-left-2">
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Domain (Host)</label>
                        <input
                          type="text"
                          placeholder="e.g. app.example.com"
                          value={formData.ingressDomain}
                          onChange={(e) => setFormData({ ...formData, ingressDomain: e.target.value })}
                          required={formData.enableIngress}
                          className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Advanced Settings Toggle */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center space-x-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors w-full"
              >
                {showAdvanced ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                <span>Advanced Settings (HPA, Configs, Secrets)</span>
              </button>
            </div>

            {/* Advanced Settings Content */}
            {showAdvanced && (
              <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-300">
                <div className="grid grid-cols-2 gap-6 bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Target CPU (%)</label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      className="w-full px-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      value={formData.targetCpuUtilization}
                      onChange={(e) => setFormData({ ...formData, targetCpuUtilization: Number(e.target.value) })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Target Memory (%)</label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      className="w-full px-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      value={formData.targetMemoryUtilization}
                      onChange={(e) => setFormData({ ...formData, targetMemoryUtilization: Number(e.target.value) })}
                    />
                  </div>
                </div>

                {/* ConfigMap */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">ConfigMap Entries</label>
                    <button
                      type="button"
                      onClick={() => addToList(configList, setConfigList)}
                      className="text-sm flex items-center space-x-1 text-blue-600 hover:text-blue-700 font-medium"
                    >
                      <Plus size={16} />
                      <span>Add Config</span>
                    </button>
                  </div>
                  <div className="space-y-3">
                    {configList.length === 0 && (
                      <div className="text-sm text-slate-400 italic text-center py-4 bg-slate-50 dark:bg-slate-900 rounded-lg border border-dashed border-slate-300 dark:border-slate-700">
                        No config entries configured.
                      </div>
                    )}
                    {configList.map((env, i) => (
                      <div key={i} className="flex items-center space-x-3">
                        <input
                          type="text"
                          placeholder="KEY"
                          className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-sm outline-none"
                          value={env.key}
                          onChange={(e) => handleListChange(configList, setConfigList, i, 'key', e.target.value)}
                        />
                        <span className="text-slate-400">=</span>
                        <input
                          type="text"
                          placeholder="VALUE"
                          className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-sm outline-none"
                          value={env.value}
                          onChange={(e) => handleListChange(configList, setConfigList, i, 'value', e.target.value)}
                        />
                        <button
                          type="button"
                          onClick={() => removeFromList(configList, setConfigList, i)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Secrets */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Secret Entries</label>
                    <button
                      type="button"
                      onClick={() => addToList(secretList, setSecretList)}
                      className="text-sm flex items-center space-x-1 text-blue-600 hover:text-blue-700 font-medium"
                    >
                      <Plus size={16} />
                      <span>Add Secret</span>
                    </button>
                  </div>
                  <div className="space-y-3">
                    {secretList.length === 0 && (
                      <div className="text-sm text-slate-400 italic text-center py-4 bg-slate-50 dark:bg-slate-900 rounded-lg border border-dashed border-slate-300 dark:border-slate-700">
                        No secret entries configured.
                      </div>
                    )}
                    {secretList.map((env, i) => (
                      <div key={i} className="flex items-center space-x-3">
                        <input
                          type="text"
                          placeholder="KEY"
                          className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-sm outline-none"
                          value={env.key}
                          onChange={(e) => handleListChange(secretList, setSecretList, i, 'key', e.target.value)}
                        />
                        <span className="text-slate-400">=</span>
                        <input
                          type="text"
                          placeholder="VALUE"
                          className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-sm outline-none"
                          value={env.value}
                          onChange={(e) => handleListChange(secretList, setSecretList, i, 'value', e.target.value)}
                        />
                        <button
                          type="button"
                          onClick={() => removeFromList(secretList, setSecretList, i)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}
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
            form="deploy-form"
            disabled={loading}
            className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-sm transition-all"
          >
            {loading ? 'Deploying...' : 'Deploy Application'}
          </button>
        </div>
      </div>
    </div>
  );
}
