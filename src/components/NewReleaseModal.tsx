import React, { useState } from 'react';
import { X, Rocket, RefreshCw } from 'lucide-react';

interface NewReleaseData {
  version: string;
  image: string;
  tag: string;
  maxUnavailable: number;
  maxSurge: number;
}

interface NewReleaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (data: NewReleaseData) => void;
  appName: string;
  serviceName: string;
  currentVersion: string;
}

export default function NewReleaseModal({ isOpen, onClose, onSubmit, appName, serviceName, currentVersion }: NewReleaseModalProps) {
  const [newVersion, setNewVersion] = useState('');
  const [image, setImage] = useState('');
  const [tag, setTag] = useState('v2.0.0');
  const [maxUnavailable, setMaxUnavailable] = useState(1);
  const [maxSurge, setMaxSurge] = useState(1);

  const handleClose = () => {
    setNewVersion('');
    setImage('');
    setTag('v2.0.0');
    setMaxUnavailable(1);
    setMaxSurge(1);
    onClose();
  };

  const handleSubmit = () => {
    onSubmit?.({ version: newVersion, image, tag, maxUnavailable, maxSurge });
    handleClose();
  };

  const canSubmit = newVersion.trim() && image.trim() && tag.trim();

  if (!isOpen) return null;

  const suggestedVersion = `v${(parseInt(currentVersion.replace('v', '')) + 1)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={handleClose}>
      <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-lg max-h-[90vh] flex flex-col shadow-2xl" onClick={e => e.stopPropagation()}>
        {/* 头部 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-700">
          <div>
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">发布新版本</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              基于 {currentVersion} 创建新版本 · {appName}/{serviceName}
            </p>
          </div>
          <button onClick={handleClose} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-all">
            <X size={20} />
          </button>
        </div>

        {/* 内容 */}
        <div className="flex-1 px-6 overflow-y-auto py-6 space-y-5">
          {/* 版本信息 */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              新版本 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={newVersion}
              onChange={e => setNewVersion(e.target.value)}
              placeholder={`例如：${suggestedVersion}`}
              className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl text-sm placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:text-slate-200 outline-none transition-all"
            />
          </div>

          {/* 镜像配置 */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              镜像 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={image}
              onChange={e => setImage(e.target.value)}
              placeholder="例如：reviews-service"
              className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl text-sm placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:text-slate-200 outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Tag <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={tag}
              onChange={e => setTag(e.target.value)}
              className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:text-slate-200 outline-none transition-all"
            />
          </div>

          {/* 发布策略 */}
          <div className="border-t border-slate-100 dark:border-slate-700 pt-5">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">发布策略</label>
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
              <div className="flex items-center space-x-2 mb-2">
                <RefreshCw size={16} className="text-blue-600 dark:text-blue-400" />
                <span className="text-sm font-medium text-blue-800 dark:text-blue-400">Rolling Update</span>
              </div>
              <p className="text-xs text-blue-600/70 dark:text-blue-400/70">逐步替换旧版本实例，确保服务不中断</p>
            </div>
          </div>

          {/* 滚动更新参数 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">最大不可用</label>
              <input
                type="number"
                value={maxUnavailable}
                onChange={e => setMaxUnavailable(Number(e.target.value))}
                min={0}
                className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:text-slate-200 outline-none transition-all"
              />
              <p className="text-xs text-slate-400 mt-1">更新过程中允许的最大不可用副本数</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">最大新增</label>
              <input
                type="number"
                value={maxSurge}
                onChange={e => setMaxSurge(Number(e.target.value))}
                min={0}
                className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:text-slate-200 outline-none transition-all"
              />
              <p className="text-xs text-slate-400 mt-1">更新过程中允许超出期望副本数的最大值</p>
            </div>
          </div>

          {/* 发布预览 */}
          <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">发布预览</p>
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">服务</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">{appName}/{serviceName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">版本</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">{currentVersion} → {newVersion || '?'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">镜像</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">{image || '-'}:{tag}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">策略</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">Rolling Update (maxUnavailable={maxUnavailable}, maxSurge={maxSurge})</span>
              </div>
            </div>
          </div>
        </div>

        {/* 底部按钮 */}
        <div className="flex items-center justify-end space-x-3 px-6 py-4 border-t border-slate-100 dark:border-slate-700">
          <button
            onClick={handleClose}
            className="px-5 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-all"
          >
            取消
          </button>
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className={`inline-flex items-center space-x-1.5 px-5 py-2 text-sm font-medium rounded-xl shadow-sm transition-all ${
              canSubmit
                ? 'text-white bg-blue-600 hover:bg-blue-700'
                : 'text-slate-400 bg-slate-100 dark:bg-slate-700 cursor-not-allowed'
            }`}
          >
            <Rocket size={16} />
            <span>开始发布</span>
          </button>
        </div>
      </div>
    </div>
  );
}
