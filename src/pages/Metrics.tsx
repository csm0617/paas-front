import React from 'react';
import { Activity, AlertTriangle, Gauge, Cpu, HardDrive, Zap, ArrowUp, ArrowDown } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string;
  unit: string;
  icon: React.ElementType;
  trend?: 'up' | 'down' | 'stable';
  color: string;
}

const mockMetrics = {
  qps: { value: '12.3k', trend: 'up' as const },
  error: { value: '0.1', unit: '%', trend: 'down' as const },
  latency: { value: '83', unit: 'ms', trend: 'stable' as const },
  cpu: { value: '31', unit: '%', trend: 'up' as const },
  memory: { value: '45', unit: '%', trend: 'up' as const },
};

const recentAlerts = [
  { level: 'warning', service: 'user-center', message: 'CPU usage above 80%', time: '5m ago' },
  { level: 'info', service: 'payment-system', message: 'New version v2 deployed', time: '12m ago' },
  { level: 'critical', service: 'data-platform', message: 'Service unreachable', time: '1h ago' },
];

const levelStyles: Record<string, string> = {
  critical: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-400',
  warning: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-700 dark:text-yellow-400',
  info: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400',
};

function MetricCard({ title, value, unit, icon: Icon, trend, color }: MetricCardProps) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className={`p-2.5 rounded-xl ${color}`}>
          <Icon size={22} />
        </div>
        {trend && (
          <div className={`flex items-center space-x-1 text-xs font-medium px-2 py-1 rounded-lg ${
            trend === 'up' ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400' :
            trend === 'down' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' :
            'bg-slate-50 dark:bg-slate-900 text-slate-500'
          }`}>
            {trend === 'up' ? <ArrowUp size={12} /> : trend === 'down' ? <ArrowDown size={12} /> : null}
            <span>{trend === 'up' ? '上升' : trend === 'down' ? '下降' : '稳定'}</span>
          </div>
        )}
      </div>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">{title}</p>
      <div className="flex items-baseline space-x-1">
        <span className="text-3xl font-bold text-slate-800 dark:text-slate-100">{value}</span>
        {unit && <span className="text-sm text-slate-400">{unit}</span>}
      </div>
    </div>
  );
}

export default function Metrics() {
  return (
    <div className="h-full flex flex-col space-y-6">
      {/* 指标卡片网格 */}
      <div className="grid grid-cols-5 gap-4">
        <MetricCard
          title="QPS"
          value={mockMetrics.qps.value}
          unit=""
          icon={Zap}
          trend={mockMetrics.qps.trend}
          color="bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
        />
        <MetricCard
          title="错误率"
          value={mockMetrics.error.value}
          unit={mockMetrics.error.unit}
          icon={AlertTriangle}
          trend={mockMetrics.error.trend}
          color="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400"
        />
        <MetricCard
          title="延迟"
          value={mockMetrics.latency.value}
          unit={mockMetrics.latency.unit}
          icon={Activity}
          trend={mockMetrics.latency.trend}
          color="bg-yellow-50 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400"
        />
        <MetricCard
          title="CPU"
          value={mockMetrics.cpu.value}
          unit={mockMetrics.cpu.unit}
          icon={Cpu}
          trend={mockMetrics.cpu.trend}
          color="bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400"
        />
        <MetricCard
          title="内存"
          value={mockMetrics.memory.value}
          unit={mockMetrics.memory.unit}
          icon={HardDrive}
          trend={mockMetrics.memory.trend}
          color="bg-cyan-50 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400"
        />
      </div>

      {/* 服务指标概览 */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700">
          <h3 className="font-semibold text-slate-800 dark:text-slate-200">服务指标概览</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-700">
                <th className="px-6 py-3 font-medium">服务</th>
                <th className="px-6 py-3 font-medium">QPS</th>
                <th className="px-6 py-3 font-medium">错误率</th>
                <th className="px-6 py-3 font-medium">延迟</th>
                <th className="px-6 py-3 font-medium">CPU</th>
                <th className="px-6 py-3 font-medium">内存</th>
                <th className="px-6 py-3 font-medium">状态</th>
              </tr>
            </thead>
            <tbody>
              {[
                { name: 'reviews', qps: '2.1k', error: '0.05%', latency: '45ms', cpu: '31%', memory: '45%', status: 'Healthy' },
                { name: 'payment', qps: '800', error: '0.3%', latency: '120ms', cpu: '22%', memory: '38%', status: 'Healthy' },
                { name: 'user-center', qps: '5.2k', error: '0.01%', latency: '28ms', cpu: '68%', memory: '72%', status: 'Warning' },
              ].map((svc) => (
                <tr key={svc.name} className="border-b border-slate-50 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-800 dark:text-slate-200">{svc.name}</td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{svc.qps}</td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{svc.error}</td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{svc.latency}</td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{svc.cpu}</td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{svc.memory}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                      svc.status === 'Healthy'
                        ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                        : 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        svc.status === 'Healthy' ? 'bg-green-500' : 'bg-yellow-500'
                      }`} />
                      {svc.status === 'Healthy' ? '正常' : '告警'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 最近告警 */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700">
          <h3 className="font-semibold text-slate-800 dark:text-slate-200">最近告警</h3>
        </div>
        <div className="divide-y divide-slate-100 dark:divide-slate-700">
          {recentAlerts.map((alert, i) => (
            <div key={i} className={`px-6 py-3 flex items-center justify-between ${levelStyles[alert.level]}`}>
              <div className="flex items-center space-x-3">
                <span className={`w-2 h-2 rounded-full ${
                  alert.level === 'critical' ? 'bg-red-500' :
                  alert.level === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
                }`} />
                <span className="font-medium text-sm">{alert.service}</span>
                <span className="text-sm opacity-80">{alert.message}</span>
              </div>
              <span className="text-xs opacity-60">{alert.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
