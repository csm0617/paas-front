import React, { useState } from 'react';
import { X, Check, ChevronLeft, ChevronRight, Server, Globe, Cpu, HardDrive } from 'lucide-react';

interface ServiceFormData {
  serviceName: string;
  serviceType: 'internal' | 'entry';
  protocol: 'HTTP' | 'gRPC' | 'TCP';
  version: string;
  image: string;
  tag: string;
  port: number;
  replicas: number;
  resources: 'small' | 'medium' | 'large';
  domain: string;
  path: string;
  https: boolean;
}

interface NewServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  appName: string;
}

const resourceSpecs = {
  small: { label: 'Small', cpu: '1 CPU', memory: '1G', desc: '适合低流量服务' },
  medium: { label: 'Medium', cpu: '2 CPU', memory: '2G', desc: '标准配置' },
  large: { label: 'Large', cpu: '4 CPU', memory: '4G', desc: '高性能配置' },
};

const defaultForm: ServiceFormData = {
  serviceName: '',
  serviceType: 'internal',
  protocol: 'HTTP',
  version: 'v1',
  image: '',
  tag: 'v1.0.0',
  port: 8080,
  replicas: 3,
  resources: 'medium',
  domain: '',
  path: '/',
  https: true,
};

export default function NewServiceModal({ isOpen, onClose, appName }: NewServiceModalProps) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<ServiceFormData>(defaultForm);

  const handleClose = () => {
    setStep(1);
    setForm(defaultForm);
    onClose();
  };

  const updateField = <K extends keyof ServiceFormData>(key: K, value: ServiceFormData[K]) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const canNext = () => {
    switch (step) {
      case 1: return form.serviceName.trim();
      case 2: return form.image.trim() && form.version.trim();
      case 3: return form.serviceType !== 'entry' || form.domain.trim();
      default: return true;
    }
  };

  const handleSubmit = () => {
    handleClose();
  };

  if (!isOpen) return null;

  const steps = [
    { num: 1, label: '服务信息', always: true },
    { num: 2, label: '初始版本', always: true },
    { num: 3, label: '入口配置', always: form.serviceType === 'entry' },
    { num: 4, label: '确认', always: true },
  ].filter(s => s.always);

  const totalSteps = steps.length;
  const isLastStep = step === totalSteps;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={handleClose}>
      <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl" onClick={e => e.stopPropagation()}>
        {/* 头部 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-700">
          <div>
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">创建服务</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">应用: {appName}</p>
          </div>
          <button onClick={handleClose} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-all">
            <X size={20} />
          </button>
        </div>

        {/* 步骤指示器 */}
        <div className="px-6 pt-6">
          <div className="flex items-center justify-center mb-8">
            {steps.map((s, i) => (
              <React.Fragment key={s.num}>
                <div className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                    step === s.num
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 dark:shadow-blue-900/50'
                      : step > s.num
                        ? 'bg-green-500 text-white'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500'
                  }`}>
                    {step > s.num ? <Check size={16} /> : s.num}
                  </div>
                  <span className={`ml-2 text-sm font-medium ${
                    step === s.num ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'
                  }`}>{s.label}</span>
                </div>
                {i < totalSteps - 1 && (
                  <div className={`w-12 h-0.5 mx-3 rounded ${
                    step > s.num ? 'bg-green-500' : 'bg-slate-200 dark:bg-slate-700'
                  }`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* 内容 */}
        <div className="flex-1 px-6 overflow-y-auto py-2">
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">服务名 <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={form.serviceName}
                  onChange={e => updateField('serviceName', e.target.value)}
                  placeholder="例如：reviews"
                  className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl text-sm placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:text-slate-200 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">类型</label>
                <div className="flex space-x-4">
                  {(['internal', 'entry'] as const).map(t => (
                    <label key={t} className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl border cursor-pointer transition-all ${
                      form.serviceType === t
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
                        : 'border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500'
                    }`}>
                      <input type="radio" name="st" checked={form.serviceType === t} onChange={() => updateField('serviceType', t)} className="sr-only" />
                      {t === 'internal' ? <Server size={16} /> : <Globe size={16} />}
                      <span className="text-sm font-medium">{t === 'internal' ? '内部服务' : '入口服务'}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">协议</label>
                <div className="flex space-x-4">
                  {(['HTTP', 'gRPC', 'TCP'] as const).map(p => (
                    <label key={p} className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl border cursor-pointer transition-all ${
                      form.protocol === p
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
                        : 'border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500'
                    }`}>
                      <input type="radio" name="proto" checked={form.protocol === p} onChange={() => updateField('protocol', p)} className="sr-only" />
                      <span className="text-sm font-medium">{p}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">版本</label>
                  <input type="text" value={form.version} onChange={e => updateField('version', e.target.value)}
                    className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:text-slate-200 outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Tag</label>
                  <input type="text" value={form.tag} onChange={e => updateField('tag', e.target.value)}
                    className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:text-slate-200 outline-none transition-all" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">镜像</label>
                <input type="text" value={form.image} onChange={e => updateField('image', e.target.value)}
                  placeholder="例如：reviews-service"
                  className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl text-sm placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:text-slate-200 outline-none transition-all" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">端口</label>
                  <input type="number" value={form.port} onChange={e => updateField('port', Number(e.target.value))}
                    className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:text-slate-200 outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">副本</label>
                  <input type="number" value={form.replicas} onChange={e => updateField('replicas', Number(e.target.value))}
                    className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:text-slate-200 outline-none transition-all" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">资源规格</label>
                <div className="grid grid-cols-3 gap-3">
                  {(Object.keys(resourceSpecs) as Array<keyof typeof resourceSpecs>).map(key => {
                    const spec = resourceSpecs[key];
                    return (
                      <button key={key} onClick={() => updateField('resources', key)}
                        className={`p-4 rounded-xl border text-left transition-all ${
                          form.resources === key
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 ring-2 ring-blue-200 dark:ring-blue-800'
                            : 'border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500'
                        }`}>
                        <div className="flex items-center space-x-2 mb-2">
                          {key === 'small' ? <Cpu size={15} className="text-slate-500" /> :
                           key === 'medium' ? <HardDrive size={15} className="text-slate-500" /> :
                           <Cpu size={15} className="text-slate-500" />}
                          <span className="font-medium text-sm text-slate-800 dark:text-slate-200">{spec.label}</span>
                        </div>
                        <p className="text-xs text-slate-500">{spec.cpu} / {spec.memory}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{spec.desc}</p>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">域名</label>
                <input type="text" value={form.domain} onChange={e => updateField('domain', e.target.value)}
                  placeholder="例如：api.mall.com"
                  className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl text-sm placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:text-slate-200 outline-none transition-all" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">路径</label>
                <input type="text" value={form.path} onChange={e => updateField('path', e.target.value)}
                  className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:text-slate-200 outline-none transition-all" />
              </div>
              <div className="flex items-center justify-between py-3 px-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl">
                <div>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300">HTTPS</p>
                  <p className="text-xs text-slate-500">启用 TLS 加密</p>
                </div>
                <button onClick={() => updateField('https', !form.https)}
                  className={`relative w-11 h-6 rounded-full transition-all ${form.https ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-600'}`}>
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-all ${form.https ? 'translate-x-5' : ''}`} />
                </button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-5 border border-blue-100 dark:border-blue-800">
                <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-400 mb-3">确认以下配置信息</h4>
                <div className="space-y-2.5">
                  {[
                    { label: '应用', value: appName },
                    { label: '服务', value: form.serviceName },
                    { label: '版本', value: form.version },
                    { label: '镜像', value: form.image ? `${form.image}:${form.tag}` : '-' },
                    { label: '端口', value: String(form.port) },
                    { label: '副本', value: String(form.replicas) },
                    { label: '类型', value: form.serviceType === 'internal' ? '内部服务' : '入口服务' },
                    { label: '协议', value: form.protocol },
                    { label: '资源', value: `${resourceSpecs[form.resources].label} (${resourceSpecs[form.resources].cpu}/${resourceSpecs[form.resources].memory})` },
                    ...(form.serviceType === 'entry' ? [{ label: '入口', value: `https://${form.domain}${form.path}` }] : []),
                  ].map(item => (
                    <div key={item.label} className="flex justify-between text-sm">
                      <span className="text-slate-500 dark:text-slate-400">{item.label}</span>
                      <span className="font-medium text-slate-800 dark:text-slate-200">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 底部按钮 */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 dark:border-slate-700">
          <button onClick={() => setStep(step - 1)}
            className={`inline-flex items-center space-x-1.5 px-4 py-2 text-sm font-medium rounded-xl transition-all ${
              step === 1 ? 'text-slate-300 dark:text-slate-600 cursor-not-allowed' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
            disabled={step === 1}>
            <ChevronLeft size={16} />
            <span>上一步</span>
          </button>

          {isLastStep ? (
            <button onClick={handleSubmit}
              className="inline-flex items-center space-x-1.5 px-6 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition-all">
              <Check size={16} />
              <span>完成创建</span>
            </button>
          ) : (
            <button onClick={() => canNext() && setStep(step + 1)}
              className={`inline-flex items-center space-x-1.5 px-5 py-2 text-sm font-medium rounded-xl transition-all ${
                canNext() ? 'text-white bg-blue-600 hover:bg-blue-700 shadow-sm' : 'text-slate-400 bg-slate-100 dark:bg-slate-700 cursor-not-allowed'
              }`}
              disabled={!canNext()}>
              <span>下一步</span>
              <ChevronRight size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
