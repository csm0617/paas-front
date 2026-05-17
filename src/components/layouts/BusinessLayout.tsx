import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  BarChart3,
  Globe,
  Settings,
  ChevronLeft,
  ChevronRight,
  Server,
  Search,
  User,
  Box,
  type LucideIcon,
} from 'lucide-react';

const navItems: { path: string; label: string; icon: LucideIcon }[] = [
  { path: '/', label: '应用', icon: LayoutDashboard },
  { path: '/services', label: '服务', icon: Server },
  { path: '/metrics', label: '监控', icon: BarChart3 },
  { path: '/entry', label: '入口', icon: Globe },
];

const bottomItems: { path: string; label: string; icon: LucideIcon }[] = [
  { path: '/settings', label: '设置', icon: Settings },
  { path: '/k8s', label: 'K8s 管理', icon: Server },
];

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
          ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 font-semibold'
          : 'hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400'
      }`}
    >
      <Icon size={20} />
      {!isCollapsed && <span className="truncate">{label}</span>}
    </Link>
  );
}

function getTitle(pathname: string): string {
  if (pathname === '/') return '应用管理';
  if (pathname.startsWith('/services')) return '服务管理';
  if (pathname.startsWith('/apps/')) return '应用运行时';
  if (pathname.startsWith('/metrics')) return '监控';
  if (pathname.startsWith('/entry')) return '入口管理';
  if (pathname.startsWith('/settings')) return '设置';
  return 'Runtime PaaS';
}

export default function BusinessLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

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
          className="absolute -right-3 top-8 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full p-1 text-slate-500 hover:text-blue-600 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity z-20 focus:outline-none"
        >
          {isSidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>

        {/* Logo */}
        <div
          className={`p-6 flex items-center shrink-0 ${
            isSidebarCollapsed ? 'justify-center' : 'space-x-3'
          }`}
        >
          <div className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white p-2 rounded-lg shrink-0 shadow-md">
            <Box size={24} />
          </div>
          {!isSidebarCollapsed && (
            <div className="truncate">
              <h1 className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                Runtime PaaS
              </h1>
              <p className="text-[10px] text-slate-400 -mt-0.5">Application Runtime OS</p>
            </div>
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
              isActive={isActive(item.path)}
            />
          ))}

          {/* Bottom items */}
          <div className="pt-4 mt-4 border-t border-slate-200 dark:border-slate-700 space-y-2">
            {bottomItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                icon={item.icon}
                label={item.label}
                isCollapsed={isSidebarCollapsed}
                isActive={isActive(item.path)}
              />
            ))}
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header with search and user */}
        <header className="h-16 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between px-8 shadow-sm z-10 shrink-0">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
            {getTitle(location.pathname)}
          </h2>

          <div className="flex items-center space-x-4">
            <form onSubmit={handleSearch} className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜索应用..."
                className="pl-9 pr-4 py-2 text-sm bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/40 w-56 transition-all"
              />
            </form>

            <div className="flex items-center space-x-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
              <User size={16} className="text-slate-400" />
              <span className="text-sm font-medium text-slate-600 dark:text-slate-400">admin</span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <div className="flex-1 overflow-auto p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
