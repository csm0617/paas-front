import React, { useState } from 'react';
import type { Application, ApplicationService, Pod } from '@/lib/types';
import { Activity, Box, Cpu, Trash2, Play, Square, ChevronDown, FileCode, Layers, Settings } from 'lucide-react';
import WorkloadSubCard from '@/components/WorkloadSubCard';

interface Props {
  app: Application;
  onScale: (app: Application, serviceName: string, workloadName: string, replicas: number) => void;
  onUpdateImage: (app: Application, serviceName: string, workloadName: string, image: string) => void;
  onDelete: (app: Application) => void;
  onViewLogs: (pod: Pod) => void;
  onOpenTerminal: (pod: Pod) => void;
  onDeletePod: (pod: Pod) => void;
  onStart: (app: Application) => void;
  onStop: (app: Application) => void;
  onRestart: (app: Application, serviceName: string, workloadName: string) => void;
  onRollback: (app: Application, serviceName: string, workloadName: string) => void;
  onViewYaml: (app: Application, serviceName?: string, workloadName?: string) => void;
  onViewEvents: (app: Application) => void;
  onEditService: (app: Application, serviceName: string) => void;
}

export default function ApplicationListItem({
  app,
  onScale,
  onUpdateImage,
  onDelete,
  onViewLogs,
  onOpenTerminal,
  onDeletePod,
  onStart,
  onStop,
  onRestart,
  onRollback,
  onViewYaml,
  onViewEvents,
  onEditService,
}: Props) {
  const computedStatus = app.status || (
    app.services.every(s => s.status === 'RUNNING') ? 'RUNNING' :
    app.services.every(s => s.status === 'STOPPED') ? 'STOPPED' :
    app.services.some(s => s.status === 'FAILED') ? 'FAILED' : 'PENDING'
  );

  const isRunning = computedStatus === 'RUNNING';
  const isFailed = computedStatus === 'FAILED';
  const isStopped = computedStatus === 'STOPPED';

  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm hover:shadow-md border border-slate-200 dark:border-slate-700 transition-all duration-300 overflow-hidden flex flex-col group relative mb-3">
      <div className="flex flex-col md:flex-row items-start md:items-center p-4 gap-4">
        <div className={`w-1.5 h-12 rounded-full shrink-0 ${isRunning ? 'bg-emerald-500' : isFailed ? 'bg-red-500' : isStopped ? 'bg-slate-500' : 'bg-amber-400'}`} />

        <div className="flex items-center space-x-3 min-w-[200px] flex-1">
          <div className="bg-blue-50 dark:bg-blue-900/30 p-2.5 rounded-xl text-blue-600 dark:text-blue-400 shrink-0">
            <Layers size={20} />
          </div>
          <div className="min-w-0">
            <h3 className="font-bold text-base text-slate-800 dark:text-slate-100 truncate" title={app.name}>{app.name}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate max-w-[250px]" title={app.description}>
              {app.description || 'No description'}
            </p>
          </div>
        </div>

        <div className="flex flex-col items-start w-32 shrink-0">
          <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Status</span>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider flex items-center space-x-1 ${
              isRunning
                ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                : isFailed
                ? 'bg-red-50 text-red-600 border border-red-200'
                : isStopped
                ? 'bg-slate-50 text-slate-600 border border-slate-200'
                : 'bg-amber-50 text-amber-600 border border-amber-200'
            }`}
          >
            <Activity size={10} className={isRunning ? 'animate-pulse' : ''} />
            <span>{computedStatus}</span>
          </span>
        </div>

        <div className="flex flex-col items-start w-32 shrink-0">
          <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1 flex items-center space-x-1">
            <Cpu size={10} />
            <span>服务</span>
          </span>
          <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            {app.services.length}
          </span>
        </div>

        <div className="flex flex-col items-start w-32 shrink-0">
          <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">命名空间</span>
          <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 truncate w-full" title={app.namespace}>
            {app.namespace}
          </span>
        </div>

        <div className="flex items-center space-x-1.5 ml-auto shrink-0">
          {isStopped ? (
            <button onClick={() => onStart(app)} className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors" title="全部启动">
              <Play size={16} />
            </button>
          ) : (
            <button onClick={() => onStop(app)} className="p-1.5 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors" title="全部停止">
              <Square size={16} />
            </button>
          )}
          <div className="w-px h-5 bg-slate-200 dark:bg-slate-700 mx-1"></div>
          <button
            onClick={() => setExpanded(!expanded)}
            className={`p-1.5 rounded-lg transition-colors ${expanded ? 'bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-800 dark:hover:text-slate-200'}`}
            title={expanded ? "收起服务" : "展开服务"}
          >
            <ChevronDown size={16} className={`transform transition-transform ${expanded ? 'rotate-180' : ''}`} />
          </button>
          <button onClick={() => onDelete(app)} className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors ml-1" title="删除">
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {expanded && (
        <div className="px-6 pb-6 border-t border-slate-100 dark:border-slate-700/50 pt-4 bg-slate-50/50 dark:bg-slate-900/20">
          <div className="space-y-4">
            {app.services.map(svc => (
              <ServiceSubCard
                key={svc.name}
                app={app}
                svc={svc}
                onScale={onScale}
                onUpdateImage={onUpdateImage}
                onRestart={onRestart}
                onRollback={onRollback}
                onViewYaml={onViewYaml}
                onViewLogs={onViewLogs}
                onOpenTerminal={onOpenTerminal}
                onDeletePod={onDeletePod}
                onViewEvents={onViewEvents}
                onEditService={onEditService}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ServiceSubCard({
  app,
  svc,
  onScale,
  onUpdateImage,
  onRestart,
  onRollback,
  onViewYaml,
  onViewLogs,
  onOpenTerminal,
  onDeletePod,
  onViewEvents,
  onEditService
}: {
  app: Application;
  svc: ApplicationService;
  onScale: Props['onScale'];
  onUpdateImage: Props['onUpdateImage'];
  onRestart: Props['onRestart'];
  onRollback: Props['onRollback'];
  onViewYaml: Props['onViewYaml'];
  onViewLogs: Props['onViewLogs'];
  onOpenTerminal: Props['onOpenTerminal'];
  onDeletePod: Props['onDeletePod'];
  onViewEvents: Props['onViewEvents'];
  onEditService: Props['onEditService'];
}) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 flex flex-col gap-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
        <div className="flex items-center space-x-2">
          <Box size={16} className="text-blue-500" />
          <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">{svc.name}</h4>
          <span className={`flex items-center space-x-1 text-[10px] px-1.5 py-0.5 rounded-sm ${svc.status === 'RUNNING' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-700'}`}>
            <Activity size={10} className={svc.status === 'RUNNING' ? 'animate-pulse' : ''} />
            <span>{svc.status || 'UNKNOWN'}</span>
          </span>
        </div>
        <div className="flex space-x-1">
          <button onClick={() => onEditService(app, svc.name)} className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-md" title="编辑服务">
            <Settings size={14} />
          </button>
          <button onClick={() => onViewYaml(app, svc.name)} className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-md" title="查看服务 YAML">
            <FileCode size={14} />
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {svc.containers.map(c => (
          <WorkloadSubCard
            key={c.name}
            app={app}
            svc={svc}
            workload={c}
            variant="list"
            onScale={onScale}
            onUpdateImage={onUpdateImage}
            onRestart={onRestart}
            onRollback={onRollback}
            onViewYaml={onViewYaml}
            onViewLogs={onViewLogs}
            onOpenTerminal={onOpenTerminal}
            onDeletePod={onDeletePod}
            onViewEvents={onViewEvents}
          />
        ))}
      </div>
    </div>
  );
}
