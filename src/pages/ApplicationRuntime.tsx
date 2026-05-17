import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Plus, Server, GitBranch, ExternalLink, ArrowRight, CheckCircle, AlertTriangle, XCircle, Settings } from 'lucide-react';
import NewServiceModal from '@/components/NewServiceModal';
import { getServicesByApp, APP_DESCRIPTIONS } from '@/data/mockData';

const statusConfig: Record<string, { color: string; bg: string; icon: React.ElementType; label: string }> = {
  Healthy: { color: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-900/20', icon: CheckCircle, label: '健康' },
  Warning: { color: 'text-yellow-600 dark:text-yellow-400', bg: 'bg-yellow-50 dark:bg-yellow-900/20', icon: AlertTriangle, label: '告警' },
  Critical: { color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-900/20', icon: XCircle, label: '异常' },
};

export default function ApplicationRuntime() {
  const { name: appName } = useParams<{ name: string }>();
  const navigate = useNavigate();

  const [showNewService, setShowNewService] = useState(false);

  if (!appName) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-400">
        <Server size={64} className="mb-4 opacity-30" />
        <p className="text-base font-medium text-slate-500 dark:text-slate-400">应用未指定</p>
        <Link to="/" className="mt-3 text-sm text-blue-600 dark:text-blue-400 hover:underline">返回应用列表</Link>
      </div>
    );
  }

  const appDescription = APP_DESCRIPTIONS[appName];
  if (!appDescription) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-400">
        <Server size={64} className="mb-4 opacity-30" />
        <p className="text-base font-medium text-slate-500 dark:text-slate-400">应用不存在</p>
        <Link to="/" className="mt-3 text-sm text-blue-600 dark:text-blue-400 hover:underline">返回应用列表</Link>
      </div>
    );
  }

  const services = getServicesByApp(appName);

  return (
    <div className="h-full flex flex-col space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-2 text-sm text-slate-400">
            <Link to="/" className="hover:text-blue-600 transition-colors">应用管理</Link>
            <span>/</span>
            <span className="text-slate-600 dark:text-slate-300 font-medium">{appName}</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mt-1">{appDescription}</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{services.length} 个服务已绑定</p>
        </div>
        <button
          onClick={() => setShowNewService(true)}
          className="inline-flex items-center space-x-1.5 px-4 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition-all"
        >
          <Plus size={16} />
          <span>新建服务</span>
        </button>
      </div>

      {services.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <GitBranch size={64} className="mb-4 opacity-30" />
          <p className="text-base font-medium text-slate-500 dark:text-slate-400">暂无服务</p>
          <p className="text-sm mt-1">请先创建服务并绑定到该应用</p>
        </div>
      ) : (
        <div className="space-y-3">
          {services.map(s => {
            const cfg = statusConfig[s.status];
            const StatusIcon = cfg.icon;
            return (
              <div
                key={s.name}
                className="group bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 hover:shadow-md transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-xl">
                      <Server size={20} className="text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold text-slate-800 dark:text-slate-200">{s.name}</h3>
                        <span className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-xs font-medium ${cfg.bg} ${cfg.color}`}>
                          <StatusIcon size={11} />
                          <span>{cfg.label}</span>
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        当前版本: <span className="font-mono">{s.currentRevision}</span>
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="px-3 py-1 text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 rounded-full">
                      {s.type === 'entry' ? '入口服务' : '内部服务'}
                    </span>
                    <Link
                      to={`/apps/${appName}/services/${s.name}`}
                      className="inline-flex items-center space-x-1.5 px-3 py-2 text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                    >
                      <span>运行管理</span>
                      <ArrowRight size={13} />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <NewServiceModal
        isOpen={showNewService}
        onClose={() => setShowNewService(false)}
        appName={appName}
      />
    </div>
  );
}
