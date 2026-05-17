import React from 'react';
import { Plus, Trash2, ChevronDown, ChevronRight } from 'lucide-react';
import ContainerForm from '@/components/deploy/ContainerForm';
import type { FormState, ServiceState, ContainerState } from '@/hooks/useDeployForm';
import { initialContainer, initialService } from '@/hooks/useDeployForm';
import type { K8sNode } from '@/lib/types';

interface Props {
  formState: FormState;
  setFormState: React.Dispatch<React.SetStateAction<FormState>>;
  expandedServices: Set<string>;
  expandedContainers: Set<string>;
  nodeList: K8sNode[];
  loadingNodes: boolean;
  isEdit: boolean;
  toggleService: (id: string) => void;
  toggleContainer: (id: string) => void;
  updateService: (sIdx: number, updater: (s: ServiceState) => ServiceState) => void;
  updateContainer: (sIdx: number, cIdx: number, updater: (c: ContainerState) => ContainerState) => void;
  handleNodePortCheck: (port: number) => void;
  onConfirmScheduling: (sIdx: number, cIdx: number) => void;
}

export default function StepServices({
  formState, setFormState,
  expandedServices, expandedContainers,
  nodeList, loadingNodes,
  isEdit,
  toggleService, toggleContainer,
  updateService, updateContainer,
  handleNodePortCheck, onConfirmScheduling,
}: Props) {
  const removeContainer = (sIdx: number, cIdx: number) => {
    updateService(sIdx, s => ({ ...s, containers: s.containers.filter((_, i) => i !== cIdx) }));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-slate-800 dark:text-slate-100">服务</h3>
        <button
          type="button"
          onClick={() => setFormState(prev => ({ ...prev, services: [...prev.services, initialService()] }))}
          disabled={isEdit}
          className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg transition-colors text-sm font-medium ${isEdit ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'}`}
        >
          <Plus size={16} /> <span>添加服务</span>
        </button>
      </div>

      <div className="space-y-4">
        {formState.services.map((svc, sIdx) => {
          const isSvcExpanded = expandedServices.has(svc.id) || formState.services.length === 1;
          return (
            <div key={svc.id} className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden bg-white dark:bg-slate-800">
              <div
                className="flex items-center justify-between px-4 py-3 bg-slate-50 dark:bg-slate-900 cursor-pointer select-none"
                onClick={() => toggleService(svc.id)}
              >
                <div className="flex items-center space-x-3">
                  {isSvcExpanded ? <ChevronDown size={18} className="text-slate-500" /> : <ChevronRight size={18} className="text-slate-500" />}
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{svc.name || '未命名服务'}</span>
                  <span className="text-xs text-slate-500 bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded-full">{svc.containers.length} 容器</span>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setFormState(prev => ({ ...prev, services: prev.services.filter((_, i) => i !== sIdx) }));
                  }}
                  disabled={isEdit}
                  className={`p-1.5 rounded transition-colors ${isEdit ? 'text-slate-400 cursor-not-allowed' : 'text-red-500 hover:bg-red-100'}`}
                >
                  <Trash2 size={16} />
                </button>
              </div>

              {isSvcExpanded && (
                <div className="p-4 border-t border-slate-200 dark:border-slate-700 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1">服务名称</label>
                      <input
                        type="text"
                        disabled={isEdit}
                        className={`w-full px-3 py-1.5 border border-slate-200 dark:border-slate-600 rounded outline-none text-sm ${isEdit ? 'bg-slate-200 dark:bg-slate-800 text-slate-500 cursor-not-allowed' : 'bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-blue-500'}`}
                        value={svc.name}
                        onChange={(e) => updateService(sIdx, s => ({ ...s, name: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="text-sm font-medium text-slate-800 dark:text-slate-200">工作负载</h4>
                      <button
                        type="button"
                        onClick={() => updateService(sIdx, s => ({ ...s, containers: [...s.containers, initialContainer()] }))}
                        className="text-xs flex items-center space-x-1 text-blue-600 hover:text-blue-700 font-medium"
                        disabled={isEdit}
                      >
                        <Plus size={14} /> <span>添加工作负载</span>
                      </button>
                    </div>
                    <div className="space-y-3">
                      {svc.containers.map((cnt, cIdx) => (
                        <ContainerForm
                          key={cnt.id}
                          cnt={cnt}
                          sIdx={sIdx}
                          cIdx={cIdx}
                          namespace={formState.namespace}
                          isEdit={isEdit}
                          isExpanded={expandedContainers.has(cnt.id) || svc.containers.length === 1}
                          nodeList={nodeList}
                          loadingNodes={loadingNodes}
                          toggleContainer={toggleContainer}
                          updateContainer={updateContainer}
                          removeContainer={removeContainer}
                          handleNodePortCheck={handleNodePortCheck}
                          onConfirmScheduling={onConfirmScheduling}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
