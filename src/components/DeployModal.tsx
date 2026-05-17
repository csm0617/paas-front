import React, { useState, useMemo } from 'react';
import { X } from 'lucide-react';
import type { DeployCommand, Application } from '@/lib/types';
import { useDeployForm } from '@/hooks/useDeployForm';
import { buildDeployCommand } from '@/lib/deployCommand';
import StepAppInfo from '@/components/deploy/StepAppInfo';
import StepServices from '@/components/deploy/StepServices';
import StepReview from '@/components/deploy/StepReview';
import ConfirmDialog from '@/components/ConfirmDialog';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onDeploy: (command: DeployCommand) => Promise<void>;
  initialApp?: Application | null;
  initialServiceName?: string | null;
}

const STEPS = ['应用信息', '服务与容器', '概览'] as const;

export default function DeployModal({ isOpen, onClose, onDeploy, initialApp, initialServiceName }: Props) {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<{ sIdx: number; cIdx: number } | null>(null);

  const isEdit = !!initialApp;

  const {
    formState, setFormState,
    expandedServices, expandedContainers,
    nodeList, loadingNodes,
    namespaceOptions,
    toggleService, toggleContainer,
    updateService, updateContainer,
    handleNodePortCheck,
    validateStep,
  } = useDeployForm({ isOpen, initialApp, initialServiceName });

  const commandPreview = useMemo(() => buildDeployCommand(formState), [formState]);

  if (!isOpen) return null;

  const handleNext = () => {
    const result = validateStep(step);
    if (!result.valid) {
      setError(result.error);
      if (result.jumpTo !== null) setStep(result.jumpTo);
      return;
    }
    setError(null);
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const handleBack = () => {
    setError(null);
    setStep((s) => Math.max(isEdit ? 1 : 0, s - 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = validateStep(2);
    if (!result.valid) {
      setError(result.error);
      if (result.jumpTo !== null) setStep(result.jumpTo);
      return;
    }

    setLoading(true);
    try {
      await onDeploy(commandPreview);
      onClose();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '部署失败';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmScheduling = (sIdx: number, cIdx: number) => {
    setConfirmAction({ sIdx, cIdx });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col border border-slate-200 dark:border-slate-700 animate-in fade-in zoom-in duration-200">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between bg-slate-50 dark:bg-slate-900/50">
          <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100">
            {initialApp && initialServiceName ? `编辑服务： ${initialServiceName}` : '部署新应用'}
          </h2>
          <button onClick={onClose} className="p-2 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <form id="deploy-form" onSubmit={handleSubmit} className="space-y-6">
            <div className="flex items-center gap-2 max-w-2xl mx-auto mb-8">
              {STEPS.map((label, i) => {
                if (isEdit && i === 0) return null;
                const displayIndex = isEdit ? i : i + 1;
                const displayLabel = label === '服务与容器' ? '服务与工作负载' : label;
                return (
                  <div key={label} className="flex items-center flex-1 min-w-0">
                    <div className="flex flex-col items-center min-w-0 w-full">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                          i <= step ? 'bg-blue-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        {displayIndex}
                      </div>
                      <div
                        className={`mt-2 text-xs font-medium text-center truncate w-full ${
                          i === step ? 'text-slate-800 dark:text-slate-100' : 'text-slate-500 dark:text-slate-400'
                        }`}
                        title={displayLabel}
                      >
                        {displayLabel}
                      </div>
                    </div>
                    {i < STEPS.length - 1 && (
                      <div className={`flex-1 h-0.5 mx-2 ${i < step ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-700'}`} />
                    )}
                  </div>
                );
              })}
            </div>

            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-600 dark:text-red-400 mb-6">
                {error}
              </div>
            )}

            {step === 0 && (
              <StepAppInfo
                formState={formState}
                setFormState={setFormState}
                namespaceOptions={namespaceOptions}
                isEdit={isEdit}
              />
            )}

            {step === 1 && (
              <StepServices
                formState={formState}
                setFormState={setFormState}
                expandedServices={expandedServices}
                expandedContainers={expandedContainers}
                nodeList={nodeList}
                loadingNodes={loadingNodes}
                isEdit={isEdit}
                toggleService={toggleService}
                toggleContainer={toggleContainer}
                updateService={updateService}
                updateContainer={updateContainer}
                handleNodePortCheck={handleNodePortCheck}
                onConfirmScheduling={handleConfirmScheduling}
              />
            )}

            {step === 2 && (
              <StepReview commandPreview={commandPreview} />
            )}
          </form>
        </div>

        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 flex items-center justify-between gap-3">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            步骤 {isEdit ? step : step + 1} / {isEdit ? STEPS.length - 1 : STEPS.length}
          </div>
          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-5 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-colors"
            >
              Cancel
            </button>

            {step > (isEdit ? 1 : 0) && (
              <button
                type="button"
                onClick={handleBack}
                disabled={loading}
                className="px-5 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-colors"
              >
                Back
              </button>
            )}

            {step < STEPS.length - 1 ? (
              <button
                type="button"
                onClick={handleNext}
                disabled={loading}
                className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-sm transition-all"
              >
                Next
              </button>
            ) : (
              <button
                type="submit"
                form="deploy-form"
                disabled={loading}
                className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-sm transition-all"
              >
                {loading ? '部署中...' : '部署'}
              </button>
            )}
          </div>
        </div>
      </div>
      <ConfirmDialog
        isOpen={!!confirmAction}
        title="切换到简单模式"
        message="切换到简单模式将清除高级调度规则，是否继续？"
        onConfirm={() => {
          if (confirmAction) {
            updateContainer(confirmAction.sIdx, confirmAction.cIdx, c => ({ ...c, schedulingMode: 'simple', nodeSelectorRows: [], affinityJson: '', tolerationsJson: '' }));
          }
          setConfirmAction(null);
        }}
        onCancel={() => setConfirmAction(null)}
        confirmText="Continue"
        isDestructive={true}
      />
    </div>
  );
}
