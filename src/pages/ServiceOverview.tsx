import React, { useState, useRef, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { Search, CheckCircle, AlertTriangle, XCircle, Server, ExternalLink, ArrowRight, Plus, ChevronDown } from 'lucide-react';
import { SERVICE_STORE, APP_NAMES, APP_DESCRIPTIONS } from '@/data/mockData';

const serviceListItems = Object.values(SERVICE_STORE).map(s => ({
  name: s.name,
  currentVersion: s.currentRevision,
  status: s.status,
  type: s.type,
  boundApps: s.boundApps,
}));

const statusConfig: Record<string, { color: string; bg: string; icon: React.ElementType; label: string }> = {
  Healthy: { color: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-900/20', icon: CheckCircle, label: '健康' },
  Warning: { color: 'text-yellow-600 dark:text-yellow-400', bg: 'bg-yellow-50 dark:bg-yellow-900/20', icon: AlertTriangle, label: '告警' },
  Critical: { color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-900/20', icon: XCircle, label: '异常' },
};

const typeLabels: Record<string, string> = {
  internal: '内部服务',
  entry: '入口服务',
};

export default function ServiceOverview() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [showCreateDropdown, setShowCreateDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [filterApp, setFilterApp] = useState('');

  const filtered = serviceListItems.filter(s => {
    const matchSearch = !searchQuery || s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.boundApps.some(a => a.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchApp = !filterApp || s.boundApps.includes(filterApp);
    return matchSearch && matchApp;
  });

  const healthyCount = serviceListItems.filter(s => s.status === 'Healthy').length;
  const warningCount = serviceListItems.filter(s => s.status === 'Warning').length;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowCreateDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="h-full flex flex-col space-y-6">
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 flex items-center space-x-4">
          <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-xl">
            <Server size={24} className="text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">总服务数</p>
            <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">{serviceListItems.length}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 flex items-center space-x-4">
          <div className="p-3 bg-purple-50 dark:bg-purple-900/30 rounded-xl">
            <Server size={24} className="text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">应用数</p>
            <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">{APP_NAMES.length}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 flex items-center space-x-4">
          <div className="p-3 bg-green-50 dark:bg-green-900/30 rounded-xl">
            <CheckCircle size={24} className="text-green-600 dark:text-green-400" />
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">健康</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">{healthyCount}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 flex items-center space-x-4">
          <div className="p-3 bg-yellow-50 dark:bg-yellow-900/30 rounded-xl">
            <AlertTriangle size={24} className="text-yellow-600 dark:text-yellow-400" />
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">告警</p>
            <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{warningCount}</p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="relative flex-1 max-w-xs">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="搜索服务名或绑定应用..."
              className="w-full pl-9 pr-4 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/40 dark:text-slate-200 transition-all"
            />
          </div>
          <select
            value={filterApp}
            onChange={e => setFilterApp(e.target.value)}
            className="px-4 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/40 dark:text-slate-200 transition-all"
          >
            <option value="">全部应用</option>
            {APP_NAMES.map(name => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>
        </div>
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowCreateDropdown(!showCreateDropdown)}
            className="inline-flex items-center space-x-1.5 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition-all"
          >
            <Plus size={16} />
            <span>新建服务</span>
            <ChevronDown size={14} />
          </button>
          {showCreateDropdown && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-lg z-10 py-1">
              <p className="px-4 py-2 text-xs text-slate-400 border-b border-slate-100 dark:border-slate-700">选择所属应用</p>
              {APP_NAMES.map(name => (
                <button
                  key={name}
                  onClick={() => { navigate(`/apps/${name}`); setShowCreateDropdown(false); }}
                  className="w-full text-left px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                >
                  {name} - {APP_DESCRIPTIONS[name]}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-700">
                <th className="px-6 py-3 font-medium">服务名称</th>
                <th className="px-6 py-3 font-medium">绑定应用</th>
                <th className="px-6 py-3 font-medium">当前版本</th>
                <th className="px-6 py-3 font-medium">类型</th>
                <th className="px-6 py-3 font-medium">状态</th>
                <th className="px-6 py-3 font-medium text-right">操作</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center text-slate-400">
                      <Search size={36} className="mb-2 opacity-30" />
                      <p className="text-sm font-medium text-slate-500 dark:text-slate-400">没有匹配的服务</p>
                      <p className="text-xs mt-1">尝试调整搜索条件或筛选应用</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map(s => {
                  const cfg = statusConfig[s.status];
                  const StatusIcon = cfg.icon;
                  return (
                    <tr key={s.name} className="border-b border-slate-50 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <Server size={15} className="text-slate-400" />
                          <span className="font-medium text-slate-800 dark:text-slate-200">{s.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {s.boundApps.map(app => (
                            <Link
                              key={app}
                              to={`/apps/${app}`}
                              className="inline-flex items-center space-x-1 px-2 py-0.5 text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                            >
                              <span>{app}</span>
                              <ExternalLink size={10} />
                            </Link>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 font-mono text-xs text-slate-600 dark:text-slate-400">{s.currentVersion}</td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-0.5 text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 rounded-full">
                          {typeLabels[s.type]}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className={`inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${cfg.bg} ${cfg.color}`}>
                          <StatusIcon size={12} />
                          <span>{cfg.label}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          to={`/apps/${s.boundApps[0]}/services/${s.name}`}
                          className="inline-flex items-center space-x-1 px-3 py-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all"
                        >
                          <span>进入</span>
                          <ArrowRight size={12} />
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
