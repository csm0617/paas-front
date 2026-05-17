import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { vNextApi, Release, ReleaseDetail, ReleaseVersion, CreateReleaseRequest } from '@/lib/api';
import {
  ArrowLeft, RefreshCw, Play, RotateCcw, Loader2, X, Clock,
  CheckCircle, XCircle, AlertTriangle, Info, Eye
} from 'lucide-react';

const STATUS_ICONS: Record<string, React.ReactNode> = {
  SUBMITTED: <Clock size={16} className="text-yellow-500" />,
  DEPLOYING: <Loader2 size={16} className="animate-spin text-blue-500" />,
  SUCCEEDED: <CheckCircle size={16} className="text-green-500" />,
  FAILED: <XCircle size={16} className="text-red-500" />,
  ROLLING_BACK: <RotateCcw size={16} className="animate-spin text-orange-500" />,
  ROLLED_BACK: <RotateCcw size={16} className="text-orange-500" />,
};

const STATUS_COLORS: Record<string, string> = {
  SUBMITTED: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  DEPLOYING: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  SUCCEEDED: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  FAILED: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  ROLLING_BACK: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
  ROLLED_BACK: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
};

interface CreateReleaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  namespace: string;
  serviceName: string;
  onCreated: () => void;
}

function CreateReleaseModal({ isOpen, onClose, namespace, serviceName, onCreated }: CreateReleaseModalProps) {
  const [strategy, setStrategy] = useState('RollingUpdate');
  const [versions, setVersions] = useState<Partial<ReleaseVersion>[]>([
    { versionName: 'v1', image: '', replicas: 1, requestsCpu: '100m', requestsMemory: '128Mi', limitsCpu: '500m', limitsMemory: '256Mi' }
  ]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const reset = useCallback(() => {
    setStrategy('RollingUpdate');
    setVersions([{ versionName: 'v1', image: '', replicas: 1, requestsCpu: '100m', requestsMemory: '128Mi', limitsCpu: '500m', limitsMemory: '256Mi' }]);
    setError('');
  }, []);

  useEffect(() => {
    if (isOpen) reset();
  }, [isOpen, reset]);

  const addVersion = () => setVersions([...versions, { versionName: `v${versions.length + 1}`, image: '', replicas: 1, requestsCpu: '100m', requestsMemory: '128Mi', limitsCpu: '500m', limitsMemory: '256Mi' }]);

  const removeVersion = (i: number) => {
    if (versions.length <= 1) return;
    setVersions(versions.filter((_, idx) => idx !== i));
  };

  const updateVersion = (i: number, field: string, value: any) => {
    const updated = [...versions];
    updated[i] = { ...updated[i], [field]: value };
    setVersions(updated);
  };

  const handleSubmit = async () => {
    if (versions.some(v => !v.image?.trim())) { setError('All versions must have an image'); return; }
    if (versions.some(v => !v.versionName?.trim())) { setError('All versions must have a version name'); return; }
    setSubmitting(true);
    setError('');
    try {
      const req: CreateReleaseRequest = {
        strategy,
        versions: versions.map(v => ({
          versionName: v.versionName!,
          image: v.image!,
          replicas: v.replicas || 1,
          requestsCpu: v.requestsCpu || '100m',
          requestsMemory: v.requestsMemory || '128Mi',
          limitsCpu: v.limitsCpu || '500m',
          limitsMemory: v.limitsMemory || '256Mi',
        })),
      };
      await vNextApi.createRelease(namespace, serviceName, req);
      onCreated();
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Failed to create release');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center" onClick={onClose}>
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-semibold">New Release</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            <X size={20} />
          </button>
        </div>
        <div className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Strategy</label>
            <select
              value={strategy}
              onChange={e => setStrategy(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-xl bg-transparent focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="RollingUpdate">RollingUpdate</option>
              <option value="Recreate">Recreate</option>
            </select>
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Versions</label>
              <button onClick={addVersion} className="text-xs text-blue-600 hover:text-blue-700 font-medium">+ Add Version</button>
            </div>
            <div className="space-y-4">
              {versions.map((v, idx) => (
                <div key={idx} className="p-4 border border-slate-200 dark:border-slate-600 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">Version {idx + 1}</span>
                    {versions.length > 1 && (
                      <button onClick={() => removeVersion(idx)} className="text-red-400 hover:text-red-600"><X size={16} /></button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">Version Name</label>
                      <input value={v.versionName || ''} onChange={e => updateVersion(idx, 'versionName', e.target.value)} className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-xl bg-transparent focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">Image</label>
                      <input value={v.image || ''} onChange={e => updateVersion(idx, 'image', e.target.value)} placeholder="nginx:latest" className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-xl bg-transparent focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">Replicas</label>
                      <input type="number" value={v.replicas || 1} onChange={e => updateVersion(idx, 'replicas', parseInt(e.target.value) || 1)} min={1} className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-xl bg-transparent focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">Requests CPU</label>
                      <input value={v.requestsCpu || ''} onChange={e => updateVersion(idx, 'requestsCpu', e.target.value)} className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-xl bg-transparent focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">Requests Memory</label>
                      <input value={v.requestsMemory || ''} onChange={e => updateVersion(idx, 'requestsMemory', e.target.value)} className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-xl bg-transparent focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">Limits CPU</label>
                      <input value={v.limitsCpu || ''} onChange={e => updateVersion(idx, 'limitsCpu', e.target.value)} className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-xl bg-transparent focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">Limits Memory</label>
                      <input value={v.limitsMemory || ''} onChange={e => updateVersion(idx, 'limitsMemory', e.target.value)} className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-xl bg-transparent focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm p-3 rounded-xl">{error}</div>
          )}
        </div>
        <div className="flex justify-end space-x-3 p-6 border-t border-slate-200 dark:border-slate-700">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl">Cancel</button>
          <button onClick={handleSubmit} disabled={submitting} className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-medium rounded-xl flex items-center space-x-2">
            {submitting && <Loader2 size={16} className="animate-spin" />}
            <span>Deploy</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function VersionDetailDrawer({ releaseDetail, onClose }: { releaseDetail: ReleaseDetail; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex justify-end" onClick={onClose}>
      <div className="bg-white dark:bg-slate-800 w-full max-w-lg h-full overflow-y-auto shadow-xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-semibold">Release #{releaseDetail.release.seq}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"><X size={20} /></button>
        </div>
        <div className="p-6 space-y-6">
          <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500">Status</span>
              <span className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[releaseDetail.release.status] || 'bg-slate-100 text-slate-700'}`}>
                {STATUS_ICONS[releaseDetail.release.status]}
                <span>{releaseDetail.release.status}</span>
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500">Strategy</span>
              <span className="text-sm font-medium">{releaseDetail.release.strategy}</span>
            </div>
            {releaseDetail.release.startedAt && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">Started</span>
                <span className="text-sm">{new Date(releaseDetail.release.startedAt).toLocaleString()}</span>
              </div>
            )}
            {releaseDetail.release.finishedAt && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">Finished</span>
                <span className="text-sm">{new Date(releaseDetail.release.finishedAt).toLocaleString()}</span>
              </div>
            )}
            {releaseDetail.release.statusMessage && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">Message</span>
                <span className="text-sm text-slate-600 dark:text-slate-400">{releaseDetail.release.statusMessage}</span>
              </div>
            )}
            {releaseDetail.release.rolledBackFromReleaseId && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">Rolled Back From</span>
                <span className="text-sm text-blue-600">{releaseDetail.release.rolledBackFromReleaseId}</span>
              </div>
            )}
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Versions ({releaseDetail.versions.length})</h4>
            <div className="space-y-3">
              {releaseDetail.versions.map((v, idx) => (
                <div key={v.id || idx} className="bg-slate-50 dark:bg-slate-900 rounded-xl p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm">{v.versionName}</span>
                    <span className="text-xs text-slate-500">{v.replicas} replica{v.replicas > 1 ? 's' : ''}</span>
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400 font-mono truncate">{v.image}</div>
                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-500">
                    <span>Requests: {v.requestsCpu} / {v.requestsMemory}</span>
                    <span>Limits: {v.limitsCpu} / {v.limitsMemory}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ServiceReleases() {
  const { namespace, serviceName } = useParams<{ namespace: string; serviceName: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [releases, setReleases] = useState<Release[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [showDetail, setShowDetail] = useState<ReleaseDetail | null>(null);
  const [rollbacking, setRollbacking] = useState(false);

  // 从 PaaSServiceList 创建服务后导航过来时，自动弹出 Create Release 弹窗
  useEffect(() => {
    if (location.state?.openCreateRelease) {
      setShowCreate(true);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const fetchReleases = useCallback(async () => {
    if (!namespace || !serviceName) return;
    setLoading(true);
    setError('');
    try {
      const data = await vNextApi.listReleases(namespace, serviceName);
      setReleases(data);
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Failed to load releases');
    } finally {
      setLoading(false);
    }
  }, [namespace, serviceName]);

  useEffect(() => { fetchReleases(); }, [fetchReleases]);

  const handleRollback = async () => {
    if (!namespace || !serviceName) return;
    setRollbacking(true);
    try {
      await vNextApi.rollbackRelease(namespace, serviceName);
      await fetchReleases();
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Rollback failed');
    } finally {
      setRollbacking(false);
    }
  };

  const viewDetail = async (release: Release) => {
    try {
      const detail = await vNextApi.getRelease(release.id);
      setShowDetail(detail);
    } catch (err: any) {
      setError('Failed to load release detail');
    }
  };

  const latestSucceeded = releases.find(r => r.status === 'SUCCEEDED');

  return (
    <div className="h-full flex flex-col space-y-6">
      <div className="flex items-center justify-between bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/paas-services')}
            className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-700 rounded-xl transition-colors"
            title="Back to Services"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200">
              <span className="text-slate-500 font-normal">{namespace}/</span>{serviceName}
            </h2>
            <p className="text-xs text-slate-500">Releases</p>
          </div>
          <button
            onClick={fetchReleases}
            disabled={loading}
            className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-700 rounded-xl transition-colors"
            title="Refresh"
          >
            <RefreshCw size={20} className={loading ? 'animate-spin text-blue-500' : ''} />
          </button>
        </div>
        <div className="flex items-center space-x-3">
          {latestSucceeded && (
            <button
              onClick={handleRollback}
              disabled={rollbacking}
              className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-orange-600 bg-orange-50 dark:bg-orange-900/20 hover:bg-orange-100 dark:hover:bg-orange-900/40 rounded-xl transition-colors"
            >
              {rollbacking ? <Loader2 size={16} className="animate-spin" /> : <RotateCcw size={16} />}
              <span>Rollback #{latestSucceeded.seq}</span>
            </button>
          )}
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 font-medium"
          >
            <Play size={18} />
            <span>New Release</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 p-4 rounded-xl flex items-center space-x-3">
          <span className="font-medium">{error}</span>
        </div>
      )}

      {loading && releases.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 size={32} className="animate-spin text-blue-500" />
        </div>
      ) : releases.length === 0 ? (
        <div className="flex-1 flex items-center justify-center bg-white dark:bg-slate-800 rounded-3xl border border-dashed border-slate-300 dark:border-slate-700">
          <div className="flex flex-col items-center space-y-4 max-w-md text-center p-8">
            <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-blue-500 mb-2">
              <Info size={32} />
            </div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200">No releases yet</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              Create the first release for {namespace}/{serviceName}
            </p>
            <button
              onClick={() => setShowCreate(true)}
              className="mt-4 flex items-center space-x-2 text-blue-600 font-semibold hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-6 py-2 rounded-full transition-colors"
            >
              <Play size={18} />
              <span>Create Release</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">#</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Strategy</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Started</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Finished</th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {releases.map(r => (
                <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                  <td className="px-6 py-4">
                    <span className="font-mono text-sm font-bold text-slate-700 dark:text-slate-300">#{r.seq}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[r.status] || 'bg-slate-100 text-slate-700'}`}>
                      {STATUS_ICONS[r.status]}
                      <span>{r.status}</span>
                    </span>
                    {r.statusReason && (
                      <span className="ml-2 text-xs text-red-500 font-medium">{r.statusReason}</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{r.strategy}</td>
                  <td className="px-6 py-4 text-sm text-slate-500">
                    {r.startedAt ? new Date(r.startedAt).toLocaleDateString() : '-'}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">
                    {r.finishedAt ? new Date(r.finishedAt).toLocaleDateString() : '-'}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => viewDetail(r)}
                      className="inline-flex items-center space-x-1 text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      <Eye size={14} />
                      <span>Detail</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <CreateReleaseModal
        isOpen={showCreate}
        onClose={() => setShowCreate(false)}
        namespace={namespace || ''}
        serviceName={serviceName || ''}
        onCreated={fetchReleases}
      />

      {showDetail && (
        <VersionDetailDrawer releaseDetail={showDetail} onClose={() => setShowDetail(null)} />
      )}
    </div>
  );
}
