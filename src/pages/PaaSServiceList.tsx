import React, { useEffect, useState, useCallback } from 'react';
import { useNamespaceStore } from '@/store/namespaceStore';
import { vNextApi, PaasService, PaasServicePort } from '@/lib/api';
import {
  Plus, RefreshCw, FolderTree, Search, Trash2,
  ExternalLink, Server, Loader2, X, Zap, ChevronRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// 模板定义：不同应用类型推荐不同的端口配置
const SERVICE_TEMPLATES = [
  { id: 'web', label: 'Web 应用', ports: [{ port: 80, protocol: 'TCP' as const }, { port: 443, protocol: 'TCP' as const }] },
  { id: 'microservice', label: '微服务', ports: [{ port: 8080, protocol: 'TCP' as const }] },
  { id: 'database', label: '数据库', ports: [{ port: 3306, protocol: 'TCP' as const }] },
  { id: 'custom', label: '自定义', ports: [] },
];

// 端口快捷按钮：点击即可添加到端口列表
const PORT_PRESETS = [80, 443, 8080, 3000, 5432, 6379, 3306, 9090];

// 快捷创建的默认配置
const QUICK_CREATE_DEFAULTS = {
  versionName: 'v1',
  replicas: 1,
  requestsCpu: '100m',
  requestsMemory: '128Mi',
  limitsCpu: '500m',
  limitsMemory: '256Mi',
  servicePorts: [{ port: 80, protocol: 'TCP' as const }],
  serviceDescription: 'Quick created',
  strategy: 'RollingUpdate',
};

interface CreateServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  namespace: string;
  onCreated: (serviceName: string) => void;
}

function CreateServiceModal({ isOpen, onClose, namespace, onCreated }: CreateServiceModalProps) {
  const [template, setTemplate] = useState('web');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [ports, setPorts] = useState<PaasServicePort[]>([{ port: 80, protocol: 'TCP' }]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const reset = useCallback(() => {
    setTemplate('web');
    setName('');
    setDescription('');
    setPorts([{ port: 80, protocol: 'TCP' }]);
    setError('');
  }, []);

  useEffect(() => {
    if (isOpen) reset();
  }, [isOpen, reset]);

  // 选择模板时自动填充端口
  const handleTemplateChange = (tplId: string) => {
    setTemplate(tplId);
    const tpl = SERVICE_TEMPLATES.find(t => t.id === tplId);
    if (tpl && tpl.ports.length > 0) {
      setPorts(tpl.ports.map(p => ({ ...p })));
    } else {
      setPorts([{ port: 80, protocol: 'TCP' }]);
    }
  };

  const addPort = () => setPorts([...ports, { port: 80, protocol: 'TCP' }]);
  const removePort = (i: number) => {
    if (ports.length <= 1) return;
    setPorts(ports.filter((_, idx) => idx !== i));
  };
  const updatePort = (i: number, field: keyof PaasServicePort, value: number | string) => {
    const updated = [...ports];
    updated[i] = { ...updated[i], [field]: value };
    setPorts(updated);
  };

  // 点击端口预设按钮快速添加端口
  const addPresetPort = (portNum: number) => {
    if (ports.some(p => p.port === portNum)) return;
    setPorts([...ports, { port: portNum, protocol: 'TCP' }]);
  };

  const handleSubmit = async () => {
    if (!name.trim()) { setError('Service name is required'); return; }
    setSubmitting(true);
    setError('');
    try {
      await vNextApi.createService(namespace, { name: name.trim(), description: description.trim(), ports });
      onCreated(name.trim());
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Failed to create service');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center" onClick={onClose}>
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-semibold">Create Service</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            <X size={20} />
          </button>
        </div>
        <div className="p-6 space-y-5">
          {/* 模板选择 */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Application Template</label>
            <div className="grid grid-cols-4 gap-2">
              {SERVICE_TEMPLATES.map(tpl => (
                <button
                  key={tpl.id}
                  onClick={() => handleTemplateChange(tpl.id)}
                  className={`px-3 py-2 text-xs font-medium rounded-xl border transition-colors ${
                    template === tpl.id
                      ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-300 dark:border-blue-600 text-blue-700 dark:text-blue-300'
                      : 'border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                  }`}
                >
                  {tpl.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Name *</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="my-service"
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-xl bg-transparent focus:ring-2 focus:ring-blue-500 outline-none"
              autoFocus
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description</label>
            <input
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Optional description"
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-xl bg-transparent focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          {/* 端口配置 */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Ports</label>
              <button onClick={addPort} className="text-xs text-blue-600 hover:text-blue-700 font-medium">
                + Add Port
              </button>
            </div>
            <div className="space-y-2">
              {ports.map((p, idx) => (
                <div key={idx} className="flex items-center space-x-2">
                  <input
                    type="number"
                    value={p.port}
                    onChange={e => updatePort(idx, 'port', parseInt(e.target.value) || 0)}
                    className="w-24 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-xl bg-transparent focus:ring-2 focus:ring-blue-500 outline-none"
                    min={1}
                    max={65535}
                  />
                  <select
                    value={p.protocol}
                    onChange={e => updatePort(idx, 'protocol', e.target.value)}
                    className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-xl bg-transparent focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="TCP">TCP</option>
                    <option value="UDP">UDP</option>
                  </select>
                  {ports.length > 1 && (
                    <button onClick={() => removePort(idx)} className="text-red-400 hover:text-red-600 p-1">
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>
            {/* 端口快捷预设按钮 */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              <span className="text-xs text-slate-400 mr-1 self-center">Quick add:</span>
              {PORT_PRESETS.map(portNum => (
                <button
                  key={portNum}
                  onClick={() => addPresetPort(portNum)}
                  disabled={ports.some(p => p.port === portNum)}
                  className={`px-2 py-0.5 text-xs rounded-md border transition-colors ${
                    ports.some(p => p.port === portNum)
                      ? 'border-slate-200 dark:border-slate-600 text-slate-300 dark:text-slate-600 cursor-not-allowed'
                      : 'border-slate-300 dark:border-slate-500 text-slate-500 dark:text-slate-400 hover:border-blue-400 hover:text-blue-600'
                  }`}
                >
                  {portNum}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm p-3 rounded-xl">
              {error}
            </div>
          )}
        </div>
        <div className="flex justify-end space-x-3 p-6 border-t border-slate-200 dark:border-slate-700">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-medium rounded-xl flex items-center space-x-2"
          >
            {submitting && <Loader2 size={16} className="animate-spin" />}
            <span>Create</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// 快捷创建模态框：只需填写名称和镜像，一键完成创建+部署
function QuickCreateModal({ isOpen, onClose, namespace, onCreated }: CreateServiceModalProps) {
  const [name, setName] = useState('');
  const [image, setImage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const reset = useCallback(() => {
    setName('');
    setImage('');
    setError('');
  }, []);

  useEffect(() => {
    if (isOpen) reset();
  }, [isOpen, reset]);

  const handleSubmit = async () => {
    if (!name.trim()) { setError('Service name is required'); return; }
    if (!image.trim()) { setError('Image is required'); return; }
    setSubmitting(true);
    setError('');
    try {
      // Step1: 创建 Service（默认端口 80/TCP）
      await vNextApi.createService(namespace, {
        name: name.trim(),
        description: QUICK_CREATE_DEFAULTS.serviceDescription,
        ports: [...QUICK_CREATE_DEFAULTS.servicePorts]
      });
      // Step2: 创建 Release（默认策略 + 单版本）
      await vNextApi.createRelease(namespace, name.trim(), {
        strategy: QUICK_CREATE_DEFAULTS.strategy,
        versions: [{
          versionName: QUICK_CREATE_DEFAULTS.versionName,
          image: image.trim(),
          replicas: QUICK_CREATE_DEFAULTS.replicas,
          requestsCpu: QUICK_CREATE_DEFAULTS.requestsCpu,
          requestsMemory: QUICK_CREATE_DEFAULTS.requestsMemory,
          limitsCpu: QUICK_CREATE_DEFAULTS.limitsCpu,
          limitsMemory: QUICK_CREATE_DEFAULTS.limitsMemory,
        }]
      });
      onCreated(name.trim());
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Quick create failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center" onClick={onClose}>
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-md mx-4" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center space-x-2">
            <Zap size={20} className="text-yellow-500" />
            <h3 className="text-lg font-semibold">Quick Create</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            <X size={20} />
          </button>
        </div>
        <div className="p-6 space-y-5">
          <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-xs p-3 rounded-xl">
            Creates a service with default port 80/TCP and deploys immediately. Configure advanced settings after creation.
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Service Name *</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="my-service"
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-xl bg-transparent focus:ring-2 focus:ring-blue-500 outline-none"
              autoFocus
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Image *</label>
            <input
              value={image}
              onChange={e => setImage(e.target.value)}
              placeholder="nginx:latest"
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-xl bg-transparent focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm p-3 rounded-xl">{error}</div>
          )}
        </div>
        <div className="flex justify-end space-x-3 p-6 border-t border-slate-200 dark:border-slate-700">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="px-5 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 disabled:opacity-50 text-white text-sm font-medium rounded-xl flex items-center space-x-2"
          >
            {submitting && <Loader2 size={16} className="animate-spin" />}
            <Zap size={16} />
            <span>Quick Deploy</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default function PaaSServiceList() {
  const { currentNamespace, namespaces, fetchNamespaces, setCurrentNamespace } = useNamespaceStore();
  const [services, setServices] = useState<PaasService[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [showQuickCreate, setShowQuickCreate] = useState(false);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const fetchServices = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await vNextApi.listServices(currentNamespace);
      setServices(data);
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Failed to load services');
    } finally {
      setLoading(false);
    }
  }, [currentNamespace]);

  useEffect(() => {
    fetchNamespaces();
  }, [fetchNamespaces]);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  // 创建 Service 后自动导航到 Releases 页面，并携带状态触发自动弹出 Release 弹窗
  const handleServiceCreated = (serviceName: string) => {
    fetchServices();
    navigate(`/paas-services/${currentNamespace}/${serviceName}/releases`, {
      state: { openCreateRelease: true }
    });
  };

  const filtered = search
    ? services.filter(s => s.name.includes(search) || s.description?.includes(search))
    : services;

  return (
    <div className="h-full flex flex-col space-y-6">
      <div className="flex items-center justify-between bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 bg-slate-100 dark:bg-slate-900 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700">
            <FolderTree size={18} className="text-slate-500" />
            <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Namespace</span>
            <select
              value={currentNamespace}
              onChange={(e) => { setCurrentNamespace(e.target.value); }}
              className="bg-transparent border-none text-sm font-bold text-blue-600 dark:text-blue-400 outline-none cursor-pointer"
            >
              {namespaces.map(ns => (
                <option key={ns.name} value={ns.name}>{ns.name}</option>
              ))}
            </select>
          </div>
          <button
            onClick={fetchServices}
            disabled={loading}
            className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-700 rounded-xl transition-colors"
            title="Refresh"
          >
            <RefreshCw size={20} className={loading ? 'animate-spin text-blue-500' : ''} />
          </button>
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search services..."
              className="pl-9 pr-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-xl bg-transparent focus:ring-2 focus:ring-blue-500 outline-none w-56"
            />
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowQuickCreate(true)}
            className="flex items-center space-x-2 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white px-5 py-2.5 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 font-medium"
          >
            <Zap size={18} />
            <span>Quick Create</span>
          </button>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 font-medium"
          >
            <Plus size={18} />
            <span>New Service</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 p-4 rounded-xl flex items-center space-x-3">
          <span className="font-medium">{error}</span>
        </div>
      )}

      {loading && services.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 size={32} className="animate-spin text-blue-500" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex-1 flex items-center justify-center bg-white dark:bg-slate-800 rounded-3xl border border-dashed border-slate-300 dark:border-slate-700">
          <div className="flex flex-col items-center space-y-4 max-w-md text-center p-8">
            <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-blue-500 mb-2">
              <Server size={32} />
            </div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200">No services found</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              {search ? 'No services match your search.' : `No services in namespace "${currentNamespace}". Create one to get started.`}
            </p>
            {!search && (
              <button
                onClick={() => setShowCreate(true)}
                className="mt-4 flex items-center space-x-2 text-blue-600 font-semibold hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-6 py-2 rounded-full transition-colors"
              >
                <Plus size={18} />
                <span>Create Service</span>
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Name</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Description</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Ports</th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {filtered.map(svc => (
                <tr
                  key={svc.id}
                  className="hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer transition-colors"
                  onClick={() => navigate(`/paas-services/${currentNamespace}/${svc.name}/releases`)}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <Server size={18} className="text-blue-500 shrink-0" />
                      <span className="font-medium text-slate-800 dark:text-slate-200">{svc.name}</span>
                    </div>
                  </td>
                <td className="px-6 py-4 text-sm text-slate-500">{svc.description || '-'}</td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-1.5">
                    {svc.ports?.map((p, idx) => (
                      <span key={idx} className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                        {p.port}/{p.protocol}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={e => { e.stopPropagation(); navigate(`/paas-services/${currentNamespace}/${svc.name}/releases`); }}
                      className="inline-flex items-center space-x-1 text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      <ExternalLink size={14} />
                      <span>Releases</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <CreateServiceModal
        isOpen={showCreate}
        onClose={() => setShowCreate(false)}
        namespace={currentNamespace}
        onCreated={handleServiceCreated}
      />
      <QuickCreateModal
        isOpen={showQuickCreate}
        onClose={() => setShowQuickCreate(false)}
        namespace={currentNamespace}
        onCreated={handleServiceCreated}
      />
    </div>
  );
}
