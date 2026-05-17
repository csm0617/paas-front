import React, { useState } from 'react';
import { X, Check, FolderKanban } from 'lucide-react';

interface CreateAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (appName: string, description: string) => void;
}

export default function CreateAppModal({ isOpen, onClose, onSubmit }: CreateAppModalProps) {
  const [appName, setAppName] = useState('');
  const [description, setDescription] = useState('');

  const handleClose = () => {
    setAppName('');
    setDescription('');
    onClose();
  };

  const handleSubmit = () => {
    onSubmit?.(appName.trim(), description.trim());
    handleClose();
  };

  const canSubmit = appName.trim();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={handleClose}>
      <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
        {/* 头部 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-700">
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">创建应用</h2>
          <button onClick={handleClose} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-all">
            <X size={20} />
          </button>
        </div>

        {/* 内容 */}
        <div className="px-6 py-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              应用名 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={appName}
              onChange={e => setAppName(e.target.value)}
              placeholder="例如：mall-system"
              className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl text-sm placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:text-slate-200 outline-none transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">描述</label>
            <input
              type="text"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="应用描述（可选）"
              className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl text-sm placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:text-slate-200 outline-none transition-all"
            />
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-100 dark:border-blue-800 flex items-start space-x-3">
            <FolderKanban size={18} className="text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium text-blue-800 dark:text-blue-400">创建后可以在应用中添加服务</p>
              <p className="text-xs text-blue-600/70 dark:text-blue-400/70 mt-0.5">进入应用详情页，点击"创建服务"即可添加</p>
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
            <Check size={16} />
            <span>创建</span>
          </button>
        </div>
      </div>
    </div>
  );
}
