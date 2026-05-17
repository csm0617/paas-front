import React from 'react';
import type { DeployCommand } from '@/lib/types';

interface Props {
  commandPreview: DeployCommand;
}

export default function StepReview({ commandPreview }: Props) {
  return (
    <div className="space-y-6">
      <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
        <div className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-4">概览</div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm border-b border-slate-200 dark:border-slate-700 pb-4">
            <div>
              <span className="text-slate-500 block mb-1">应用</span>
              <span className="font-medium text-slate-800 dark:text-slate-100">{commandPreview.name}</span>
            </div>
            <div>
              <span className="text-slate-500 block mb-1">命名空间</span>
              <span className="font-medium text-slate-800 dark:text-slate-100">{commandPreview.namespace}</span>
            </div>
          </div>

          <div className="space-y-3">
            <span className="text-slate-500 text-sm font-medium">Services ({commandPreview.services.length})</span>
            {commandPreview.services.map((svc, i) => (
              <div key={i} className="p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm">
                <div className="flex justify-between font-medium mb-2">
                  <span>{svc.name}</span>
                  <span>{svc.replicas} / {svc.maxReplicas} 副本</span>
                </div>
                <div className="text-slate-500 text-xs mb-2">
                  {svc.enableIngress ? `Ingress: ${svc.ingressDomain}` : '无入口'}
                </div>
                <div className="space-y-1">
                  {svc.containers.map((c, j) => (
                    <div key={j} className="flex items-center justify-between pl-3 border-l-2 border-slate-200 dark:border-slate-700">
                      <span className="font-mono text-xs">{c.image}</span>
                      <span className="text-xs bg-slate-100 dark:bg-slate-900 px-1.5 py-0.5 rounded">{c.ports?.map(p => p.port).join(', ')}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">部署 JSON</label>
        <textarea
          readOnly
          rows={12}
          className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
          value={JSON.stringify(commandPreview, null, 2)}
        />
      </div>
    </div>
  );
}
