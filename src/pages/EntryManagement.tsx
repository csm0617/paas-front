import React, { useState } from 'react';
import { Globe, Plus, Pencil, Trash2, Shield, ExternalLink, Copy, CheckCircle } from 'lucide-react';

interface Route {
  id: string;
  path: string;
  targetService: string;
  methods: string[];
  stripPrefix: boolean;
  enabled: boolean;
}

const mockEntry = {
  domain: 'api.mall.com',
  https: true,
  certificate: 'wildcard-mall-com',
};

const mockRoutes: Route[] = [
  { id: 'r1', path: '/reviews', targetService: 'reviews', methods: ['GET', 'POST'], stripPrefix: false, enabled: true },
  { id: 'r2', path: '/payment', targetService: 'payment', methods: ['POST'], stripPrefix: false, enabled: true },
  { id: 'r3', path: '/users', targetService: 'user-center', methods: ['GET', 'POST', 'PUT', 'DELETE'], stripPrefix: false, enabled: true },
  { id: 'r4', path: '/api/order', targetService: 'order', methods: ['GET', 'POST'], stripPrefix: true, enabled: false },
];

export default function EntryManagement() {
  const [routes, setRoutes] = useState<Route[]>(mockRoutes);
  const [copied, setCopied] = useState(false);

  const handleCopyDomain = () => {
    navigator.clipboard.writeText(mockEntry.domain);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleRoute = (id: string) => {
    setRoutes(routes.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r));
  };

  return (
    <div className="h-full flex flex-col space-y-6">
      {/* 入口域名卡片 */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-purple-50 dark:bg-purple-900/30 rounded-xl">
              <Globe size={22} className="text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800 dark:text-slate-200">默认入口</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">所有外部流量通过此域名进入</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            {mockEntry.https && (
              <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-xs font-medium">
                <Shield size={12} />
                <span>HTTPS</span>
              </span>
            )}
            <button
              onClick={handleCopyDomain}
              className="inline-flex items-center space-x-1 px-3 py-1.5 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              {copied ? <CheckCircle size={14} className="text-green-500" /> : <Copy size={14} />}
              <span>{copied ? '已复制' : '复制'}</span>
            </button>
          </div>
        </div>

        <div className="flex items-center space-x-4 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-700">
          <div className="flex-1 flex items-center space-x-2 text-lg font-mono text-slate-800 dark:text-slate-200">
            <span className="text-slate-400">https://</span>
            <span className="font-bold">{mockEntry.domain}</span>
          </div>
          <ExternalLink size={18} className="text-slate-400" />
        </div>
      </div>

      {/* 路由管理 */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
          <h3 className="font-semibold text-slate-800 dark:text-slate-200">路由规则</h3>
          <button className="inline-flex items-center space-x-1.5 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition-all">
            <Plus size={16} />
            <span>新增路由</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-700">
                <th className="px-6 py-3 font-medium">路径</th>
                <th className="px-6 py-3 font-medium">目标服务</th>
                <th className="px-6 py-3 font-medium">方法</th>
                <th className="px-6 py-3 font-medium">去前缀</th>
                <th className="px-6 py-3 font-medium">状态</th>
                <th className="px-6 py-3 font-medium">操作</th>
              </tr>
            </thead>
            <tbody>
              {routes.map((route) => (
                <tr key={route.id} className="border-b border-slate-50 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors">
                  <td className="px-6 py-4">
                    <code className="px-2 py-1 bg-slate-100 dark:bg-slate-900 rounded-lg text-sm font-mono text-blue-600 dark:text-blue-400">
                      {route.path}
                    </code>
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-800 dark:text-slate-200">
                    {route.targetService}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {route.methods.map(m => (
                        <span key={m} className="px-1.5 py-0.5 text-[10px] font-mono font-medium bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 rounded">
                          {m}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {route.stripPrefix ? (
                      <span className="text-green-600 dark:text-green-400 font-medium">是</span>
                    ) : (
                      <span className="text-slate-400">否</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => toggleRoute(route.id)}
                      className={`px-2.5 py-0.5 rounded-full text-xs font-medium transition-all ${
                        route.enabled
                          ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                          : 'bg-slate-100 dark:bg-slate-700 text-slate-400'
                      }`}
                    >
                      {route.enabled ? '启用' : '禁用'}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <button className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors" title="编辑">
                        <Pencil size={15} />
                      </button>
                      <button className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors" title="删除">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {routes.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400">
            <Globe size={48} className="mb-4 opacity-50" />
            <p className="text-base font-medium">暂无路由规则</p>
            <p className="text-sm mt-1">点击"新增路由"添加第一条规则</p>
          </div>
        )}
      </div>
    </div>
  );
}
