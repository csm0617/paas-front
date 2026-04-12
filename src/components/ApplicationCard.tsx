import React, { useEffect, useState } from 'react';
import { ApplicationDeployment, podApi, Pod } from '@/lib/api';
import { Activity, Box, Cpu, Trash2, Edit3, TerminalSquare, FileText, ArrowUpCircle, Play, Square, RotateCw, Undo2, ChevronDown, ChevronUp } from 'lucide-react';

interface Props {
  app: ApplicationDeployment;
  onScale: (app: ApplicationDeployment) => void;
  onUpdateImage: (app: ApplicationDeployment) => void;
  onDelete: (app: ApplicationDeployment) => void;
  onViewLogs: (pod: Pod) => void;
  onOpenTerminal: (pod: Pod) => void;
  onStart: (app: ApplicationDeployment) => void;
  onStop: (app: ApplicationDeployment) => void;
  onRestart: (app: ApplicationDeployment) => void;
  onRollback: (app: ApplicationDeployment) => void;
}

export default function ApplicationCard({
  app,
  onScale,
  onUpdateImage,
  onDelete,
  onViewLogs,
  onOpenTerminal,
  onStart,
  onStop,
  onRestart,
  onRollback,
}: Props) {
  const isRunning = app.status === 'RUNNING';
  const isFailed = app.status === 'FAILED';
  const isStopped = app.status === 'STOPPED';

  const [pods, setPods] = useState<Pod[]>([]);
  const [showPods, setShowPods] = useState(false);
  const [loadingPods, setLoadingPods] = useState(false);

  const fetchPods = async () => {
    try {
      setLoadingPods(true);
      const data = await podApi.list(app.namespace, { app: app.name });
      setPods(data);
    } catch (err) {
      console.error('Failed to fetch pods:', err);
    } finally {
      setLoadingPods(false);
    }
  };

  useEffect(() => {
    if (showPods) {
      fetchPods();
    }
  }, [showPods, app.namespace, app.name]);

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm hover:shadow-md border border-slate-200 dark:border-slate-700 transition-all duration-300 overflow-hidden flex flex-col group relative">
      <div className={`h-1 w-full ${isRunning ? 'bg-emerald-500' : isFailed ? 'bg-red-500' : isStopped ? 'bg-slate-500' : 'bg-amber-400'}`} />

      <div className="p-6 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded-xl text-blue-600 dark:text-blue-400">
              <Box size={24} />
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">{app.name}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-1 flex items-center">
                <span className="bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-md truncate max-w-[180px]">
                  {app.image}
                </span>
              </p>
            </div>
          </div>
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider flex items-center space-x-1 ${
              isRunning
                ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                : isFailed
                ? 'bg-red-50 text-red-600 border border-red-200'
                : isStopped
                ? 'bg-slate-50 text-slate-600 border border-slate-200'
                : 'bg-amber-50 text-amber-600 border border-amber-200'
            }`}
          >
            <Activity size={12} className={isRunning ? 'animate-pulse' : ''} />
            <span>{app.status}</span>
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-auto mb-6 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl">
          <div className="flex flex-col">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider mb-1">
              Namespace
            </span>
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center">
              {app.namespace}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider mb-1 flex items-center space-x-1">
              <Cpu size={12} />
              <span>Replicas</span>
            </span>
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              {app.replicas} Pods
            </span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 pt-4 border-t border-slate-100 dark:border-slate-700/50">
          <button
            onClick={() => onScale(app)}
            className="flex-1 flex items-center justify-center space-x-1 py-2 px-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-colors"
          >
            <ArrowUpCircle size={16} />
            <span>Scale</span>
          </button>
          <button
            onClick={() => onUpdateImage(app)}
            className="flex-1 flex items-center justify-center space-x-1 py-2 px-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition-colors"
          >
            <Edit3 size={16} />
            <span>Image</span>
          </button>
        </div>

        <div className="flex flex-wrap gap-2 pt-2">
          {isStopped ? (
            <button
              onClick={() => onStart(app)}
              className="flex items-center justify-center p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg text-emerald-600 hover:bg-emerald-50 hover:border-emerald-200 transition-colors"
              title="Start"
            >
              <Play size={18} />
            </button>
          ) : (
            <button
              onClick={() => onStop(app)}
              className="flex items-center justify-center p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors"
              title="Stop"
            >
              <Square size={18} />
            </button>
          )}
          <button
            onClick={() => onRestart(app)}
            className="flex items-center justify-center p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors"
            title="Restart"
          >
            <RotateCw size={18} />
          </button>
          <button
            onClick={() => onRollback(app)}
            className="flex items-center justify-center p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors"
            title="Rollback"
          >
            <Undo2 size={18} />
          </button>
          <button
            onClick={() => setShowPods(!showPods)}
            className="flex items-center justify-center p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors"
            title={showPods ? "Hide Pods" : "Show Pods"}
          >
            {showPods ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
          <button
            onClick={() => onDelete(app)}
            className="flex items-center justify-center p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg text-red-500 hover:bg-red-50 hover:border-red-200 transition-colors ml-auto"
            title="Delete"
          >
            <Trash2 size={18} />
          </button>
        </div>

        {showPods && (
          <div className="mt-4 border-t border-slate-100 dark:border-slate-700/50 pt-4">
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Pods</h4>
            {loadingPods ? (
              <div className="text-sm text-slate-400">Loading pods...</div>
            ) : pods.length === 0 ? (
              <div className="text-sm text-slate-400">No pods found.</div>
            ) : (
              <div className="space-y-2">
                {pods.map(pod => (
                  <div key={pod.name} className="flex flex-col bg-slate-50 dark:bg-slate-900/50 p-2 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono text-slate-700 dark:text-slate-300 truncate w-32" title={pod.name}>{pod.name}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-sm ${pod.status === 'Running' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{pod.status}</span>
                    </div>
                    <div className="flex justify-end space-x-1 mt-2">
                      <button onClick={() => onViewLogs(pod)} className="p-1 text-slate-500 hover:text-blue-500" title="Logs">
                        <FileText size={14} />
                      </button>
                      <button onClick={() => onOpenTerminal(pod)} className="p-1 text-slate-500 hover:text-blue-500" title="Terminal">
                        <TerminalSquare size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
