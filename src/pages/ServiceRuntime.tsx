import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Plus, RefreshCw, GitBranch, ArrowLeftRight, XCircle, CheckCircle, AlertTriangle, Activity, Zap, Cpu, HardDrive, RotateCcw, AlertCircle } from 'lucide-react';
import NewReleaseModal from '@/components/NewReleaseModal';
import ExpertModePanel from '@/components/ExpertModePanel';
import { getServiceByName, ServiceDetail, Revision } from '@/data/mockData';

const statusConfig: Record<string, { color: string; bg: string; icon: React.ElementType; label: string }> = {
  Running: { color: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-900/20', icon: CheckCircle, label: '运行中' },
  Ready: { color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/20', icon: ArrowLeftRight, label: '就绪' },
  Failed: { color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-900/20', icon: XCircle, label: '失败' },
};

export default function ServiceRuntime() {
  const { name: appName, serviceName } = useParams<{ name: string; serviceName: string }>();

  const [serviceDetail, setServiceDetail] = useState<ServiceDetail>(() => {
    if (!serviceName) return undefined as unknown as ServiceDetail;
    const data = getServiceByName(serviceName);
    return data ? JSON.parse(JSON.stringify(data)) : undefined as unknown as ServiceDetail;
  });

  const [showNewRelease, setShowNewRelease] = useState(false);

  const [confirmAction, setConfirmAction] = useState<{
    type: 'rollback' | 'switch' | 'offline';
    version: string;
    title: string;
    message: string;
  } | null>(null);

  if (!serviceDetail) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-400">
        <GitBranch size={64} className="mb-4 opacity-30" />
        <p className="text-base font-medium text-slate-500 dark:text-slate-400">服务不存在</p>
        <Link to={appName ? `/apps/${appName}` : '/'} className="mt-3 text-sm text-blue-600 dark:text-blue-400 hover:underline">
          {appName ? '返回应用详情' : '返回应用列表'}
        </Link>
      </div>
    );
  }

  const { revisions } = serviceDetail;

  // 验证当前应用是否绑定了该服务
  const isBoundToApp = appName ? serviceDetail.boundApps.includes(appName) : true;

  const updateService = (updater: (prev: ServiceDetail) => ServiceDetail) => {
    setServiceDetail(prev => updater(prev));
  };

  const handleRollback = (version: string) => {
    setConfirmAction({
      type: 'rollback',
      version,
      title: '确认回滚',
      message: `确定要将 ${serviceName} 回滚到 ${version} 吗？回滚后流量将全部切换到该版本。`,
    });
  };

  const handleSwitch = (version: string) => {
    setConfirmAction({
      type: 'switch',
      version,
      title: '切换流量',
      message: `确定要将流量全量切换到 ${version} 吗？`,
    });
  };

  const handleOffline = (version: string) => {
    setConfirmAction({
      type: 'offline',
      version,
      title: '确认下线',
      message: `确定要将 ${version} 下线吗？下线后该版本将不再接收流量。`,
    });
  };

  const executeConfirm = () => {
    if (!confirmAction) return;
    const { type, version } = confirmAction;

    updateService(prev => {
      const newRevisions = prev.revisions.map(r => ({ ...r }));

      switch (type) {
        case 'rollback': {
          newRevisions.forEach(r => {
            r.traffic = r.version === version ? 100 : 0;
            r.status = r.version === version ? 'Running' : 'Ready';
          });
          return { ...prev, currentRevision: version, revisions: newRevisions };
        }
        case 'switch': {
          newRevisions.forEach(r => {
            r.traffic = r.version === version ? 100 : 0;
          });
          return { ...prev, revisions: newRevisions };
        }
        case 'offline': {
          newRevisions.forEach(r => {
            if (r.version === version) {
              r.replicas = 0;
              r.traffic = 0;
              r.status = 'Ready';
            }
          });
          const runningRevision = newRevisions.find(r => r.traffic > 0);
          return {
            ...prev,
            currentRevision: prev.currentRevision === version
              ? (runningRevision?.version || prev.currentRevision)
              : prev.currentRevision,
            revisions: newRevisions,
          };
        }
        default:
          return prev;
      }
    });

    setConfirmAction(null);
  };

  const handleNewRelease = (data: { version: string; image: string; tag: string }) => {
    const newRevision: Revision = {
      version: data.version,
      image: `${data.image}:${data.tag}`,
      replicas: 0,
      traffic: 0,
      status: 'Ready',
    };
    updateService(prev => ({
      ...prev,
      revisions: [newRevision, ...prev.revisions],
    }));
  };

  return (
    <div className="h-full flex flex-col space-y-6">
      <div className="flex items-center space-x-2 text-sm text-slate-400">
        <Link to="/" className="hover:text-blue-600 transition-colors">应用管理</Link>
        {appName && (
          <>
            <span>/</span>
            <Link to={`/apps/${appName}`} className="hover:text-blue-600 transition-colors">{appName}</Link>
          </>
        )}
        <span>/</span>
        <span className="text-slate-600 dark:text-slate-300 font-medium">{serviceName}</span>
      </div>

      {!isBoundToApp && appName && (
        <div className="flex items-center space-x-2 px-4 py-2.5 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-xl text-sm text-yellow-700 dark:text-yellow-400">
          <AlertTriangle size={16} />
          <span>该服务未绑定到「{appName}」，当前为独立查看模式。可通过服务总览页绑定。</span>
        </div>
      )}

      {/* 服务绑定的应用标签 */}
      <div className="flex items-center space-x-2">
        <span className="text-xs text-slate-400">已绑定应用：</span>
        {serviceDetail.boundApps.map(app => (
          <Link
            key={app}
            to={`/apps/${app}/services/${serviceName}`}
            className="inline-flex items-center space-x-1 px-2.5 py-1 text-xs font-medium bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
          >
            <span>{app}</span>
          </Link>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">{serviceName}</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{serviceDetail.description}</p>
        </div>
        <button
          onClick={() => setShowNewRelease(true)}
          className="inline-flex items-center space-x-1.5 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition-all"
        >
          <Plus size={16} />
          <span>发布新版本</span>
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'QPS', value: serviceDetail.qps, icon: Zap, color: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30' },
          { label: '错误率', value: serviceDetail.error, icon: Activity, color: 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30' },
          { label: 'CPU', value: serviceDetail.cpu, icon: Cpu, color: 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/30' },
          { label: '内存', value: serviceDetail.memory, icon: HardDrive, color: 'text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-900/30' },
        ].map(item => (
          <div key={item.label} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${item.color}`}>
              <item.icon size={18} />
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">{item.label}</p>
              <p className="text-lg font-bold text-slate-800 dark:text-slate-100">{item.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-5">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
            <RefreshCw size={18} className="text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">当前版本</p>
            <p className="text-lg font-bold text-slate-800 dark:text-slate-100">{serviceDetail.currentRevision}</p>
          </div>
          <span className="ml-auto inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
            <span>运行中</span>
          </span>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700">
          <h3 className="font-semibold text-slate-800 dark:text-slate-200">版本列表</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-700">
                <th className="px-6 py-3 font-medium">版本</th>
                <th className="px-6 py-3 font-medium">镜像</th>
                <th className="px-6 py-3 font-medium">副本</th>
                <th className="px-6 py-3 font-medium">流量</th>
                <th className="px-6 py-3 font-medium">状态</th>
                <th className="px-6 py-3 font-medium text-right">操作</th>
              </tr>
            </thead>
            <tbody>
              {revisions.map((rev) => {
                const cfg = statusConfig[rev.status];
                const StatusIcon = cfg.icon;
                const isCurrent = rev.version === serviceDetail.currentRevision;
                const isOffline = rev.replicas === 0 && rev.traffic === 0 && rev.status !== 'Running';
                return (
                  <tr key={rev.version} className="border-b border-slate-50 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <span className={`font-bold ${isCurrent ? 'text-blue-600 dark:text-blue-400' : 'text-slate-800 dark:text-slate-200'}`}>
                          {rev.version}
                        </span>
                        {isCurrent && (
                          <span className="px-1.5 py-0.5 text-[10px] font-medium bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded">当前</span>
                        )}
                        {isOffline && (
                          <span className="px-1.5 py-0.5 text-[10px] font-medium bg-slate-100 dark:bg-slate-700 text-slate-400 rounded">已下线</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-slate-600 dark:text-slate-400">{rev.image}</td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{rev.replicas}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-20 h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-500 rounded-full transition-all"
                            style={{ width: `${rev.traffic}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium text-slate-600 dark:text-slate-400">{rev.traffic}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-xs font-medium ${cfg.bg} ${cfg.color}`}>
                        <StatusIcon size={11} />
                        <span>{cfg.label}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="inline-flex items-center space-x-1">
                        {!isCurrent && !isOffline && (
                          <button
                            onClick={() => handleRollback(rev.version)}
                            className="inline-flex items-center space-x-1 px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-all"
                          >
                            <RotateCcw size={12} />
                            <span>回滚</span>
                          </button>
                        )}
                        {rev.status !== 'Failed' && (
                          <button
                            onClick={() => handleSwitch(rev.version)}
                            className="inline-flex items-center space-x-1 px-3 py-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all"
                          >
                            <ArrowLeftRight size={12} />
                            <span>切换</span>
                          </button>
                        )}
                        {isCurrent && !isOffline && (
                          <button
                            onClick={() => handleOffline(rev.version)}
                            className="inline-flex items-center space-x-1 px-3 py-1.5 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                          >
                            <XCircle size={12} />
                            <span>下线</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <ExpertModePanel />

      <NewReleaseModal
        isOpen={showNewRelease}
        onClose={() => setShowNewRelease(false)}
        onSubmit={handleNewRelease}
        appName={appName || ''}
        serviceName={serviceName || ''}
        currentVersion={serviceDetail.currentRevision}
      />

      {confirmAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setConfirmAction(null)}>
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 w-full max-w-sm shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-yellow-50 dark:bg-yellow-900/30 rounded-lg">
                <AlertCircle size={20} className="text-yellow-600 dark:text-yellow-400" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">{confirmAction.title}</h3>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">{confirmAction.message}</p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setConfirmAction(null)}
                className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-all"
              >
                取消
              </button>
              <button
                onClick={executeConfirm}
                className={`px-4 py-2 text-sm font-medium text-white rounded-xl shadow-sm transition-all ${
                  confirmAction.type === 'offline'
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {confirmAction.type === 'offline' ? '确认下线' : '确认'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
