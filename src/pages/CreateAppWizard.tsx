import React, { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Layers, Network, Rocket, Server } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

type WizardStep = 0 | 1 | 2 | 3;

interface WizardFormState {
  serviceName: string;
  description: string;
  image: string;
  version: string;
  replicas: number;
  protocol: 'HTTP' | 'TCP' | 'GRPC';
  domain: string;
  path: string;
}

const STEP_META = [
  { title: 'Service', icon: Server },
  { title: 'Release', icon: Rocket },
  { title: 'Entry', icon: Network },
  { title: 'Review', icon: Layers },
] as const;

const INITIAL_FORM: WizardFormState = {
  serviceName: '',
  description: '',
  image: '',
  version: 'v1',
  replicas: 1,
  protocol: 'HTTP',
  domain: '',
  path: '/',
};

export default function CreateAppWizard() {
  const navigate = useNavigate();
  const [step, setStep] = useState<WizardStep>(0);
  const [form, setForm] = useState<WizardFormState>(INITIAL_FORM);

  const canGoNext = useMemo(() => {
    if (step === 0) {
      return form.serviceName.trim().length > 0;
    }
    if (step === 1) {
      return form.image.trim().length > 0 && form.version.trim().length > 0;
    }
    return true;
  }, [form, step]);

  const updateField = <K extends keyof WizardFormState>(field: K, value: WizardFormState[K]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const goNext = () => {
    if (!canGoNext || step === 3) {
      return;
    }
    setStep((prev) => (prev + 1) as WizardStep);
  };

  const goPrev = () => {
    if (step === 0) {
      navigate(-1);
      return;
    }
    setStep((prev) => (prev - 1) as WizardStep);
  };

  return (
    <div className="flex h-full flex-col space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <div className="flex items-center justify-between gap-4">
          {STEP_META.map((item, index) => {
            const Icon = item.icon;
            const active = step === index;
            const complete = step > index;
            return (
              <div key={item.title} className="flex flex-1 items-center gap-3 last:flex-none">
                <div className="flex items-center gap-3">
                  <div
                    className={`rounded-xl p-2 ${
                      active
                        ? 'bg-blue-600 text-white'
                        : complete
                          ? 'bg-green-500 text-white'
                          : 'bg-slate-100 text-slate-400 dark:bg-slate-700'
                    }`}
                  >
                    <Icon size={16} />
                  </div>
                  <div className="text-sm font-medium text-slate-700 dark:text-slate-200">{item.title}</div>
                </div>
                {index < STEP_META.length - 1 && (
                  <div className={`h-px flex-1 ${index < step ? 'bg-green-400' : 'bg-slate-200 dark:bg-slate-600'}`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex-1 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-700 dark:bg-slate-800">
        {step === 0 && (
          <div className="max-w-2xl space-y-5">
            <h3 className="text-lg font-semibold">Service Information</h3>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Service Name</label>
              <input
                value={form.serviceName}
                onChange={(event) => updateField('serviceName', event.target.value)}
                placeholder="e.g. reviews"
                className="w-full rounded-xl border border-slate-300 bg-transparent px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-600"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Description</label>
              <input
                value={form.description}
                onChange={(event) => updateField('description', event.target.value)}
                placeholder="Describe the service"
                className="w-full rounded-xl border border-slate-300 bg-transparent px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-600"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Protocol</label>
              <select
                value={form.protocol}
                onChange={(event) => updateField('protocol', event.target.value as WizardFormState['protocol'])}
                className="w-full rounded-xl border border-slate-300 bg-transparent px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-600"
              >
                <option value="HTTP">HTTP</option>
                <option value="TCP">TCP</option>
                <option value="GRPC">GRPC</option>
              </select>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="max-w-2xl space-y-5">
            <h3 className="text-lg font-semibold">Initial Release</h3>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Image</label>
              <input
                value={form.image}
                onChange={(event) => updateField('image', event.target.value)}
                placeholder="registry.example.com/reviews:v1"
                className="w-full rounded-xl border border-slate-300 bg-transparent px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-600"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Version</label>
                <input
                  value={form.version}
                  onChange={(event) => updateField('version', event.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-transparent px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-600"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Replicas</label>
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={form.replicas}
                  onChange={(event) => updateField('replicas', Number(event.target.value) || 1)}
                  className="w-full rounded-xl border border-slate-300 bg-transparent px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-600"
                />
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="max-w-2xl space-y-5">
            <h3 className="text-lg font-semibold">Entry Configuration</h3>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Domain</label>
              <input
                value={form.domain}
                onChange={(event) => updateField('domain', event.target.value)}
                placeholder="reviews.example.com"
                className="w-full rounded-xl border border-slate-300 bg-transparent px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-600"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Path</label>
              <input
                value={form.path}
                onChange={(event) => updateField('path', event.target.value)}
                placeholder="/"
                className="w-full rounded-xl border border-slate-300 bg-transparent px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-600"
              />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="max-w-3xl space-y-5">
            <h3 className="text-lg font-semibold">Review</h3>
            {/* 用只读摘要恢复页面可用性，后续再接入真实提交逻辑。 */}
            <div className="rounded-2xl bg-slate-50 p-5 text-sm dark:bg-slate-900/40">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <div className="text-slate-400">Service Name</div>
                  <div className="font-medium">{form.serviceName || '-'}</div>
                </div>
                <div>
                  <div className="text-slate-400">Protocol</div>
                  <div className="font-medium">{form.protocol}</div>
                </div>
                <div>
                  <div className="text-slate-400">Image</div>
                  <div className="font-medium">{form.image || '-'}</div>
                </div>
                <div>
                  <div className="text-slate-400">Version</div>
                  <div className="font-medium">{form.version}</div>
                </div>
                <div>
                  <div className="text-slate-400">Replicas</div>
                  <div className="font-medium">{form.replicas}</div>
                </div>
                <div>
                  <div className="text-slate-400">Entry</div>
                  <div className="font-medium">{form.domain ? `${form.domain}${form.path}` : 'Not configured'}</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-6 py-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <button
          type="button"
          onClick={goPrev}
          className="inline-flex items-center space-x-2 rounded-xl px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700"
        >
          <ChevronLeft size={16} />
          <span>{step === 0 ? 'Back' : 'Previous'}</span>
        </button>

        <button
          type="button"
          onClick={goNext}
          disabled={!canGoNext || step === 3}
          className="inline-flex items-center space-x-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:bg-blue-400"
        >
          <span>{step === 3 ? 'Completed' : 'Next'}</span>
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
