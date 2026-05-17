import React, { useState } from 'react';
import { LayoutDashboard, Settings, Layers, Box, Share2, Link as LinkIcon, Server, FileCode, Activity, FolderTree, ChevronLeft, ChevronRight, type LucideIcon } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

interface NavItem {
  path: string;
  label: string;
  icon: LucideIcon;
}

const NAV_ITEMS: NavItem[] = [
  { path: '/', label: '应用管理', icon: LayoutDashboard },
  { path: '/nodes', label: '节点', icon: Server },
  { path: '/namespaces', label: '命名空间', icon: FolderTree },
  { path: '/deployments', label: '部署', icon: Activity },
  { path: '/pods', label: '容器组', icon: Box },
  { path: '/services', label: '服务', icon: Share2 },
  { path: '/ingresses', label: '入口', icon: LinkIcon },
  { path: '/configmaps', label: '配置组', icon: FileCode },
  { path: '/settings', label: '设置', icon: Settings },
];

const PAGE_TITLES: Record<string, string> = {
  '/': '应用管理',
  '/nodes': '节点管理',
  '/namespaces': '命名空间管理',
  '/deployments': '部署管理',
  '/pods': '容器组管理',
  '/services': '服务管理',
  '/ingresses': '入口管理',
  '/configmaps': '配置组管理',
  '/settings': '设置',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-sans">
      <aside className={`${isSidebarCollapsed ? 'w-20' : 'w-64'} transition-all duration-300 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 shadow-sm flex flex-col h-full relative group`}>
        <button
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          className="absolute -right-3 top-8 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full p-1 text-slate-500 hover:text-blue-600 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity z-20 focus:outline-none"
        >
          {isSidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>

        <div className={`p-6 flex items-center shrink-0 ${isSidebarCollapsed ? 'justify-center' : 'space-x-3'}`}>
          <div className="bg-blue-600 text-white p-2 rounded-lg shrink-0">
            <Layers size={24} />
          </div>
          {!isSidebarCollapsed && (
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 truncate transition-opacity duration-300">
              PaaS 控制台
            </h1>
          )}
        </div>
        <nav className="flex-1 overflow-y-auto mt-6 px-4 space-y-2 pb-6 overflow-x-hidden">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                title={isSidebarCollapsed ? item.label : ""}
                className={`flex items-center px-4 py-3 rounded-xl transition-all duration-200 ${isSidebarCollapsed ? 'justify-center' : 'space-x-3'} ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 font-semibold'
                    : 'hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400'
                }`}
              >
                <Icon size={20} className="shrink-0" />
                {!isSidebarCollapsed && <span className="truncate">{item.label}</span>}
              </Link>
            );
          })}
        </nav>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center px-8 shadow-sm z-10">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
            {PAGE_TITLES[location.pathname] || '页面未找到'}
          </h2>
        </header>
        <div className="flex-1 overflow-auto p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
