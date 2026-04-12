import React, { useEffect, useState, useRef } from 'react';
import { ApplicationDeployment, api } from '@/lib/api';
import { X, RefreshCcw } from 'lucide-react';

interface Props {
  app: ApplicationDeployment | null;
  onClose: () => void;
}

export default function LogsDrawer({ app, onClose }: Props) {
  const [logs, setLogs] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const logsEndRef = useRef<HTMLDivElement>(null);

  const fetchLogs = async () => {
    if (!app) return;
    try {
      setLoading(true);
      const data = await api.getLogs(app.namespace, app.name, 200);
      setLogs(data || 'No logs available.');
      // Auto scroll to bottom
      setTimeout(() => {
        logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err: any) {
      setLogs(`Error fetching logs: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (app) {
      fetchLogs();
    } else {
      setLogs('');
      setAutoRefresh(false);
    }
  }, [app]);

  useEffect(() => {
    let interval: number;
    if (autoRefresh && app) {
      interval = window.setInterval(() => {
        fetchLogs();
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [autoRefresh, app]);

  if (!app) return null;

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm transition-opacity" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-3xl bg-slate-900 shadow-2xl flex flex-col border-l border-slate-700 transform transition-transform duration-300">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between text-slate-100 bg-slate-950">
          <div>
            <h2 className="text-lg font-bold font-mono text-blue-400">Log Viewer</h2>
            <p className="text-xs text-slate-400 mt-1">{app.namespace} / {app.name}</p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                autoRefresh ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <RefreshCcw size={14} className={autoRefresh ? 'animate-spin-slow' : ''} />
              <span>{autoRefresh ? 'Auto' : 'Manual'}</span>
            </button>
            <button
              onClick={fetchLogs}
              disabled={loading}
              className="p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
              title="Refresh Logs"
            >
              <RefreshCcw size={16} className={loading && !autoRefresh ? 'animate-spin' : ''} />
            </button>
            <div className="w-px h-6 bg-slate-700 mx-2" />
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-red-500/20 hover:text-red-400 rounded-lg transition-colors">
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 bg-[#0a0a0a] font-mono text-sm leading-relaxed scroll-smooth">
          {loading && !logs && (
            <div className="text-slate-500 animate-pulse">Loading logs...</div>
          )}
          <pre className="text-slate-300 whitespace-pre-wrap break-all">
            {logs}
          </pre>
          <div ref={logsEndRef} />
        </div>
      </div>
    </>
  );
}
