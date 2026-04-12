import React, { useEffect, useState } from 'react';
import { useAppStore } from '@/store/appStore';
import ApplicationCard from '@/components/ApplicationCard';
import DeployModal from '@/components/DeployModal';
import LogsDrawer from '@/components/LogsDrawer';
import TerminalDrawer from '@/components/TerminalDrawer';
import { ApplicationDeployment, DeployCommand } from '@/lib/api';
import { Plus, RefreshCw, FolderTree, AlertCircle } from 'lucide-react';

export default function Dashboard() {
  const { namespace, deployments, loading, error, setNamespace, fetchDeployments, deploy, scale, updateImage, deleteDeployment, start, stop, restart, rollback } = useAppStore();

  const [isDeployModalOpen, setDeployModalOpen] = useState(false);
  const [logsApp, setLogsApp] = useState<ApplicationDeployment | null>(null);
  const [terminalApp, setTerminalApp] = useState<ApplicationDeployment | null>(null);

  useEffect(() => {
    fetchDeployments();
  }, [fetchDeployments]);

  const handleScale = async (app: ApplicationDeployment) => {
    const reps = window.prompt(`Enter new replicas for ${app.name}`, app.replicas.toString());
    if (reps !== null) {
      const n = parseInt(reps, 10);
      if (!isNaN(n) && n >= 0) {
        await scale(app.name, n);
      }
    }
  };

  const handleUpdateImage = async (app: ApplicationDeployment) => {
    const img = window.prompt(`Enter new image for ${app.name}`, app.image);
    if (img) {
      await updateImage(app.name, img);
    }
  };

  const handleDelete = async (app: ApplicationDeployment) => {
    if (window.confirm(`Are you sure you want to delete application '${app.name}'?`)) {
      await deleteDeployment(app.name);
    }
  };

  const handleDeploy = async (command: DeployCommand) => {
    await deploy(command);
  };

  const handleStart = async (app: ApplicationDeployment) => {
    await start(app.name);
  };

  const handleStop = async (app: ApplicationDeployment) => {
    if (window.confirm(`Are you sure you want to stop application '${app.name}'?`)) {
      await stop(app.name);
    }
  };

  const handleRestart = async (app: ApplicationDeployment) => {
    if (window.confirm(`Are you sure you want to restart application '${app.name}'?`)) {
      await restart(app.name);
    }
  };

  const handleRollback = async (app: ApplicationDeployment) => {
    if (window.confirm(`Are you sure you want to rollback application '${app.name}' to its previous version?`)) {
      await rollback(app.name);
    }
  };

  return (
    <div className="h-full flex flex-col space-y-6">
      {/* Top Action Bar */}
      <div className="flex items-center justify-between bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 bg-slate-100 dark:bg-slate-900 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700">
            <FolderTree size={18} className="text-slate-500" />
            <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Namespace</span>
            <select
              value={namespace}
              onChange={(e) => setNamespace(e.target.value)}
              className="bg-transparent border-none text-sm font-bold text-blue-600 dark:text-blue-400 outline-none cursor-pointer"
            >
              <option value="default">default</option>
              <option value="kube-system">kube-system</option>
              <option value="monitoring">monitoring</option>
            </select>
          </div>
          <button
            onClick={() => fetchDeployments()}
            disabled={loading}
            className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-700 rounded-xl transition-colors"
            title="Refresh"
          >
            <RefreshCw size={20} className={loading ? 'animate-spin text-blue-500' : ''} />
          </button>
        </div>

        <button
          onClick={() => setDeployModalOpen(true)}
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 font-medium"
        >
          <Plus size={18} />
          <span>New Deployment</span>
        </button>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 p-4 rounded-xl flex items-center space-x-3">
          <AlertCircle size={20} />
          <span className="font-medium">{error}</span>
        </div>
      )}

      {/* Main Grid */}
      {loading && deployments.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center space-y-4 text-slate-400">
            <RefreshCw size={32} className="animate-spin text-blue-500" />
            <p>Loading applications...</p>
          </div>
        </div>
      ) : deployments.length === 0 ? (
        <div className="flex-1 flex items-center justify-center bg-white dark:bg-slate-800 rounded-3xl border border-dashed border-slate-300 dark:border-slate-700">
          <div className="flex flex-col items-center space-y-4 max-w-md text-center p-8">
            <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-blue-500 mb-2">
              <FolderTree size={32} />
            </div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200">No applications found</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              There are no deployments in the <span className="font-mono text-blue-500">{namespace}</span> namespace.
              Click "New Deployment" to create one.
            </p>
            <button
              onClick={() => setDeployModalOpen(true)}
              className="mt-4 flex items-center space-x-2 text-blue-600 font-semibold hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-6 py-2 rounded-full transition-colors"
            >
              <Plus size={18} />
              <span>Deploy Now</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6 content-start pb-8">
          {deployments.map((app) => (
            <ApplicationCard
              key={app.id}
              app={app}
              onScale={handleScale}
              onUpdateImage={handleUpdateImage}
              onDelete={handleDelete}
              onViewLogs={setLogsApp}
              onOpenTerminal={setTerminalApp}
              onStart={handleStart}
              onStop={handleStop}
              onRestart={handleRestart}
              onRollback={handleRollback}
            />
          ))}
        </div>
      )}

      {/* Modals & Drawers */}
      <DeployModal
        isOpen={isDeployModalOpen}
        onClose={() => setDeployModalOpen(false)}
        onDeploy={handleDeploy}
      />
      <LogsDrawer
        app={logsApp}
        onClose={() => setLogsApp(null)}
      />
      <TerminalDrawer
        app={terminalApp}
        onClose={() => setTerminalApp(null)}
      />
    </div>
  );
}
