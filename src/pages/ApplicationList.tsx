import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Server, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import CreateAppModal from '@/components/CreateAppModal';
import { APP_DESCRIPTIONS, APP_NAMES, getServicesByApp } from '@/data/mockData';

interface AppData {
  name: string;
  description: string;
  serviceCount: number;
  status: 'Healthy' | 'Warning' | 'Critical';
}

const initialApps: AppData[] = APP_NAMES.map(name => {
  const services = getServicesByApp(name);
  const hasWarning = services.some(s => s.status === 'Warning');
  const hasCritical = services.some(s => s.status === 'Critical');
  return {
    name,
    description: APP_DESCRIPTIONS[name],
    serviceCount: services.length,
    status: hasCritical ? 'Critical' : hasWarning ? 'Warning' : 'Healthy',
  };
});

const statusConfig: Record<string, { color: string; bg: string; icon: React.ElementType; label: string }> = {
  Healthy: { color: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-900/20', icon: CheckCircle, label: '正常' },
  Warning: { color: 'text-yellow-600 dark:text-yellow-400', bg: 'bg-yellow-50 dark:bg-yellow-900/20', icon: AlertTriangle, label: '告警' },
  Critical: { color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-900/20', icon: XCircle, label: '异常' },
};

export default function ApplicationList() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [apps, setApps] = useState<AppData[]>(initialApps);

  return (
    <div className="h-full flex flex-col">
      {/* 顶部操作栏 */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-sm text-slate-500 dark:text-slate-400">共 {apps.length} 个应用</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center space-x-1.5 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition-all"
        >
          <Plus size={16} />
          <span>创建应用</span>
        </button>
      </div>

      {/* 应用卡片网格 */}
      {apps.length > 0 ? (
        <div className="grid grid-cols-2 gap-4">
          {apps.map(app => {
            const cfg = statusConfig[app.status];
            const StatusIcon = cfg.icon;
            return (
              <div
                key={app.name}
                className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-6 hover:shadow-md hover:border-blue-200 dark:hover:border-blue-700 transition-all group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {app.name}
                    </h3>
                    {app.description && (
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{app.description}</p>
                    )}
                  </div>
                  <div className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-medium ${cfg.bg} ${cfg.color}`}>
                    <StatusIcon size={12} />
                    <span>{cfg.label}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2 text-sm text-slate-500 dark:text-slate-400 mb-5">
                  <Server size={14} />
                  <span>Services: {app.serviceCount}</span>
                  {app.serviceCount === 0 && (
                    <span className="text-xs text-yellow-500 ml-1">- 点击进入添加服务</span>
                  )}
                </div>

                <Link
                  to={`/apps/${app.name}`}
                  className="inline-flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded-xl transition-all"
                >
                  进入
                </Link>
              </div>
            );
          })}
        </div>
      ) : (
        /* 空状态 */
        <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
          <Server size={64} className="mb-4 opacity-30" />
          <p className="text-base font-medium text-slate-500 dark:text-slate-400">暂无应用</p>
          <p className="text-sm mt-1">点击上方"创建应用"开始</p>
        </div>
      )}

      {/* 创建应用 Modal */}
      <CreateAppModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={(name, description) => {
          setApps(prev => [{ name, description, serviceCount: 0, status: 'Healthy' }, ...prev]);
        }}
      />
    </div>
  );
}
