import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import {
  Server,
  FolderTree,
  Activity,
  Box,
  Share2,
  Link as LinkIcon,
  FileCode,
  LayoutDashboard,
  ChevronLeft,
  ChevronRight,
  Layers,
  ArrowLeft,
  type LucideIcon,
} from 'lucide-react';

const navItems = [
  { path: '/k8s', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/k8s/nodes', label: 'Nodes', icon: Server },
  { path: '/k8s/namespaces', label: 'Namespaces', icon: FolderTree },
  { path: '/k8s/deployments', label: 'Deployments', icon: Activity },
  { path: '/k8s/pods', label: 'Pods', icon: Box },
  { path: '/k8s/services', label: 'Services', icon: Share2 },
  { path: '/k8s/ingresses', label: 'Ingresses', icon: LinkIcon },
  { path: '/k8s/configmaps', label: 'Config Groups', icon: FileCode },
];

const titleMap: Record<string, string> = {
  '/k8s': 'K8s Dashboard',
  '/k8s/nodes': 'Node Management',
  '/k8s/namespaces': 'Namespace Management',
  '/k8s/deployments': 'Deployment Management',
  '/k8s/pods': 'Pod Management',
  '/k8s/services': 'Service Management',
  '/k8s/ingresses': 'Ingress Management',
  '/k8s/configmaps': 'Config Group Management',
};

function getTitle(pathname: string): string {
  // Match the most specific path
  const matched = Object.keys(titleMap)
    .sort((a, b) => b.length - a.length)
    .find((key) => pathname.startsWith(key));
  return matched ? titleMap[matched] : 'K8s Management';
}

function NavLink({
  to,
  icon: Icon,
  label,
  isCollapsed,
  isActive,
}: {
  to: string;
  icon: LucideIcon;
  label: string;
  isCollapsed: boolean;
  isActive: boolean;
}) {
  return (
    <Link
      to={to}
      title={isCollapsed ? label : ''}
      className={`flex items-center px-4 py-3 rounded-xl transition-all duration-200 ${
        isCollapsed ? 'justify-center' : 'space-x-3'
      } ${
        isActive
          ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 font-semibold'
          : 'hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400'
      }`}
    >
      <Icon size={20} />
      {!isCollapsed && <span className="truncate">{label}</span>}
    </Link>
  );
}

export default function K8sLayout() {
  const location = useLocation();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-sans">
      {/* Sidebar */}
      <aside
        className={`${
          isSidebarCollapsed ? 'w-20' : 'w-64'
        } transition-all duration-300 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 shadow-sm flex flex-col h-full relative group`}
      >
        {/* Collapse toggle */}
        <button
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          className="absolute -right-3 top-8 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full p-1 text-slate-500 hover:text-indigo-600 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity z-20 focus:outline-none"
        >
          {isSidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>

        {/* Logo */}
        <div
          className={`p-6 flex items-center shrink-0 ${
            isSidebarCollapsed ? 'justify-center' : 'space-x-3'
          }`}
        >
          <div className="bg-indigo-600 text-white p-2 rounded-lg shrink-0">
            <Layers size={24} />
          </div>
          {!isSidebarCollapsed && (
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 truncate transition-opacity duration-300">
              K8s Management
            </h1>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-4 space-y-2 pb-6 overflow-x-hidden">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              icon={item.icon}
              label={item.label}
              isCollapsed={isSidebarCollapsed}
              isActive={
                item.path === '/k8s'
                  ? location.pathname === '/k8s'
                  : location.pathname.startsWith(item.path)
              }
            />
          ))}

          {/* Back to Business */}
          <div className="pt-4 mt-4 border-t border-slate-200 dark:border-slate-700">
            <NavLink
              to="/"
              icon={ArrowLeft}
              label="Back to Business"
              isCollapsed={isSidebarCollapsed}
              isActive={false}
            />
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center px-8 shadow-sm z-10">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
            {getTitle(location.pathname)}
          </h2>
        </header>
        <div className="flex-1 overflow-auto p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
