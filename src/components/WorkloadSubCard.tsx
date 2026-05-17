import React, { useCallback, useEffect, useState, useRef } from 'react';
import { podApi } from '@/lib/api';
import type { Application, ApplicationService, ContainerSpec, Pod } from '@/lib/types';
import { Activity, Trash2, Edit3, TerminalSquare, FileText, ArrowUpCircle, RotateCw, Undo2, FileCode, ListOrdered } from 'lucide-react';
import { useK8sWatch } from '@/hooks/useK8sWatch';
import { getErrorMessage, getPhaseMeta, podDiagnosis } from '@/lib/utils';

interface WorkloadSubCardProps {
  app: Application;
  svc: ApplicationService;
  workload: ContainerSpec;
  variant: 'card' | 'list';
  onScale: (app: Application, serviceName: string, workloadName: string, replicas: number) => void;
  onUpdateImage: (app: Application, serviceName: string, workloadName: string, image: string) => void;
  onRestart: (app: Application, serviceName: string, workloadName: string) => void;
  onRollback: (app: Application, serviceName: string, workloadName: string) => void;
  onViewYaml: (app: Application, serviceName?: string, workloadName?: string) => void;
  onViewLogs: (pod: Pod) => void;
  onOpenTerminal: (pod: Pod) => void;
  onDeletePod: (pod: Pod) => void;
  onViewEvents: (app: Application) => void;
}

export default function WorkloadSubCard({
  app,
  svc,
  workload,
  variant,
  onScale,
  onUpdateImage,
  onRestart,
  onRollback,
  onViewYaml,
  onViewLogs,
  onOpenTerminal,
  onDeletePod,
  onViewEvents,
}: WorkloadSubCardProps) {
  const [pods, setPods] = useState<Pod[]>([]);
  const [loadingPods, setLoadingPods] = useState(false);
  const [podsError, setPodsError] = useState<string | null>(null);

  const fetchPodsTimeout = useRef<number | null>(null);

  const fetchPods = useCallback(() => {
    if (fetchPodsTimeout.current) window.clearTimeout(fetchPodsTimeout.current);
    fetchPodsTimeout.current = window.setTimeout(async () => {
      try {
        setLoadingPods(true);
        setPodsError(null);
        const data = await podApi.list(app.namespace, { 'paas.csm.com/service': svc.name, 'paas.csm.com/workload': workload.name });
        setPods(data);
      } catch (err) {
        setPodsError(getErrorMessage(err));
      } finally {
        setLoadingPods(false);
      }
    }, 300);
  }, [app.namespace, svc.name, workload.name]);

  useEffect(() => {
    fetchPods();
  }, [fetchPods]);

  useK8sWatch(app.namespace, (event) => {
    if (event.type === 'pod') {
      fetchPods();
    }
  });

  const workloadButtons = (
    <div className="flex space-x-1">
      <button onClick={() => onUpdateImage(app, svc.name, workload.name, workload.image)} className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-md" title="更新镜像">
        <Edit3 size={14} />
      </button>
      <button onClick={() => onScale(app, svc.name, workload.name, workload.replicas ?? 1)} className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-md" title="扩缩容">
        <ArrowUpCircle size={14} />
      </button>
      <button onClick={() => onRestart(app, svc.name, workload.name)} className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded-md" title="重启">
        <RotateCw size={14} />
      </button>
      <button onClick={() => onRollback(app, svc.name, workload.name)} className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded-md" title="回滚">
        <Undo2 size={14} />
      </button>
      <button onClick={() => onViewYaml(app, svc.name, workload.name)} className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded-md" title="查看工作负载 YAML">
        <FileCode size={14} />
      </button>
    </div>
  );

  const podsHeader = (
    <div className="flex items-center justify-between mb-2">
      <span className="text-xs font-semibold text-slate-500">Pods ({pods.length}/{workload.replicas ?? 1})</span>
      <button onClick={fetchPods} disabled={loadingPods} className="text-xs text-slate-500 hover:text-slate-700">
        <RotateCw size={12} className={loadingPods ? 'animate-spin' : ''} />
      </button>
    </div>
  );

  if (variant === 'card') {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-lg p-3 border border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between mb-3">
          <div className="flex flex-col truncate">
            <span className="font-semibold text-sm text-slate-700 dark:text-slate-300">{workload.name}</span>
            <span className="text-slate-500 font-mono text-xs truncate max-w-[200px]">{workload.image}</span>
          </div>
          {workloadButtons}
        </div>

        <div className="pt-2 border-t border-slate-100 dark:border-slate-700/50">
          {podsHeader}
          {podsError && <div className="text-[10px] text-red-500 mb-2">{podsError}</div>}
          <div className="space-y-1">
            {pods.map(pod => {
              const phaseMeta = getPhaseMeta(pod);
              const diag = podDiagnosis(pod);
              return (
                <div key={pod.name} className="flex flex-col bg-slate-50 dark:bg-slate-900/50 p-1.5 rounded border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-slate-700 dark:text-slate-300 truncate w-32" title={pod.name}>{pod.name}</span>
                    <span className={`flex items-center space-x-1 text-[9px] px-1 py-0.5 rounded-sm ${phaseMeta.cls}`}>
                      <Activity size={8} className={phaseMeta.phase.toLowerCase() === 'running' ? 'animate-pulse' : ''} />
                      <span>{phaseMeta.phase}</span>
                    </span>
                  </div>
                  {diag && (
                    <div className="mt-0.5 text-[9px] text-slate-500 truncate" title={diag}>{diag}</div>
                  )}
                  <div className="flex justify-end space-x-1 mt-1">
                    <button onClick={() => onViewLogs(pod)} className="p-0.5 text-slate-400 hover:text-blue-500" title="日志">
                      <FileText size={12} />
                    </button>
                    <button onClick={() => onOpenTerminal(pod)} className="p-0.5 text-slate-400 hover:text-blue-500" title="终端">
                      <TerminalSquare size={12} />
                    </button>
                    <button onClick={() => onViewEvents(app)} className="p-0.5 text-slate-400 hover:text-blue-500" title="事件">
                      <ListOrdered size={12} />
                    </button>
                    <button onClick={() => onDeletePod(pod)} className="p-0.5 text-slate-400 hover:text-red-500 ml-1" title="删除容器组">
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col xl:flex-row gap-4 bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg border border-slate-100 dark:border-slate-700">
      <div className="w-full xl:w-1/3 flex flex-col border-r-0 xl:border-r border-slate-200 dark:border-slate-700 pr-0 xl:pr-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex flex-col truncate">
            <span className="font-semibold text-sm text-slate-700 dark:text-slate-300">{workload.name}</span>
            <span className="text-slate-500 font-mono text-xs truncate max-w-[200px]" title={workload.image}>{workload.image}</span>
          </div>
          {workloadButtons}
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        {podsHeader}
        {podsError && <div className="text-[10px] text-red-500 mb-2">{podsError}</div>}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {pods.map(pod => {
            const phaseMeta = getPhaseMeta(pod);
            const diag = podDiagnosis(pod);
            return (
              <div key={pod.name} className="flex flex-col bg-white dark:bg-slate-800 p-2 rounded border border-slate-100 dark:border-slate-700">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-slate-700 dark:text-slate-300 truncate w-32 md:w-48" title={pod.name}>{pod.name}</span>
                  <span className={`flex items-center space-x-1 text-[10px] px-1.5 py-0.5 rounded-sm ${phaseMeta.cls}`}>
                    <Activity size={10} className={phaseMeta.phase.toLowerCase() === 'running' ? 'animate-pulse' : ''} />
                    <span>{phaseMeta.phase}</span>
                  </span>
                </div>
                {diag && (
                  <div className="mt-1 text-[10px] text-slate-500 truncate" title={diag}>{diag}</div>
                )}
                <div className="flex justify-end space-x-1 mt-2 pt-2 border-t border-slate-100 dark:border-slate-700/50">
                  <button onClick={() => onViewLogs(pod)} className="p-1.5 text-slate-500 hover:text-blue-500 hover:bg-blue-50 rounded-md" title="日志">
                    <FileText size={14} />
                  </button>
                  <button onClick={() => onOpenTerminal(pod)} className="p-1.5 text-slate-500 hover:text-blue-500 hover:bg-blue-50 rounded-md" title="终端">
                    <TerminalSquare size={14} />
                  </button>
                  <button onClick={() => onViewEvents(app)} className="p-1.5 text-slate-500 hover:text-blue-500 hover:bg-blue-50 rounded-md" title="事件">
                    <ListOrdered size={14} />
                  </button>
                  <button onClick={() => onDeletePod(pod)} className="p-1.5 text-slate-500 hover:text-red-500 hover:bg-red-50 rounded-md ml-1" title="删除容器组">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
