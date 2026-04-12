import React from 'react';
import { LayoutDashboard, Settings, Layers, Box } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="p-6 flex items-center space-x-3">
          <div className="bg-blue-600 text-white p-2 rounded-lg">
            <Layers size={24} />
          </div>
          <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
            PaaS Console
          </h1>
        </div>
        <nav className="mt-6 px-4 space-y-2">
          <Link
            to="/"
            className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
              location.pathname === '/'
                ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 font-semibold'
                : 'hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400'
            }`}
          >
            <LayoutDashboard size={20} />
            <span>Applications</span>
          </Link>
          <Link
            to="/namespaces"
            className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
              location.pathname === '/namespaces'
                ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 font-semibold'
                : 'hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400'
            }`}
          >
            <Box size={20} />
            <span>Namespaces</span>
          </Link>
          <Link
            to="/settings"
            className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
              location.pathname === '/settings'
                ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 font-semibold'
                : 'hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400'
            }`}
          >
            <Settings size={20} />
            <span>Settings</span>
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center px-8 shadow-sm z-10">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
            {location.pathname === '/' ? 'Application Management' : location.pathname === '/namespaces' ? 'Namespace Management' : 'Settings'}
          </h2>
        </header>
        <div className="flex-1 overflow-auto p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
