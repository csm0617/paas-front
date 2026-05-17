import React from 'react';
import { Plus, Trash2, X, ChevronDown, ChevronRight, Network } from 'lucide-react';
import ConfigMountSection from '@/components/ConfigMountSection';
import SchedulingSection from '@/components/SchedulingSection';
import type { ContainerState } from '@/hooks/useDeployForm';
import type { K8sNode } from '@/lib/types';

interface Props {
  cnt: ContainerState;
  sIdx: number;
  cIdx: number;
  namespace: string;
  isEdit: boolean;
  isExpanded: boolean;
  nodeList: K8sNode[];
  loadingNodes: boolean;
  toggleContainer: (id: string) => void;
  updateContainer: (sIdx: number, cIdx: number, updater: (c: ContainerState) => ContainerState) => void;
  removeContainer: (sIdx: number, cIdx: number) => void;
  handleNodePortCheck: (port: number) => void;
  onConfirmScheduling: (sIdx: number, cIdx: number) => void;
}

const renderKeyValueList = (
  list: { key: string; value: string }[],
  onChange: (list: { key: string; value: string }[]) => void,
  placeholderKey: string = 'KEY',
  placeholderValue: string = 'VALUE'
) => {
  return (
    <div className="space-y-2">
      {list.map((item, i) => (
        <div key={i} className="flex items-center space-x-2">
          <input
            type="text"
            placeholder={placeholderKey}
            className="flex-1 px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded focus:ring-2 focus:ring-blue-500 font-mono text-sm outline-none"
            value={item.key}
            onChange={(e) => {
              const next = [...list];
              next[i].key = e.target.value;
              onChange(next);
            }}
          />
          <span className="text-slate-400">=</span>
          <input
            type="text"
            placeholder={placeholderValue}
            className="flex-1 px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded focus:ring-2 focus:ring-blue-500 font-mono text-sm outline-none"
            value={item.value}
            onChange={(e) => {
              const next = [...list];
              next[i].value = e.target.value;
              onChange(next);
            }}
          />
          <button
            type="button"
            onClick={() => {
              const next = [...list];
              next.splice(i, 1);
              onChange(next);
            }}
            className="p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...list, { key: '', value: '' }])}
        className="text-xs flex items-center space-x-1 text-blue-600 hover:text-blue-700 font-medium"
      >
        <Plus size={14} />
        <span>添加条目</span>
      </button>
    </div>
  );
};

export default function ContainerForm({
  cnt, sIdx, cIdx, namespace, isEdit, isExpanded,
  nodeList, loadingNodes,
  toggleContainer, updateContainer, removeContainer, handleNodePortCheck, onConfirmScheduling,
}: Props) {
  return (
    <div className="border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 overflow-hidden">
      <div
        className="flex items-center justify-between px-3 py-2 bg-slate-50 dark:bg-slate-900/50 cursor-pointer"
        onClick={() => toggleContainer(cnt.id)}
      >
        <div className="flex items-center space-x-2">
          {isExpanded ? <ChevronDown size={16} className="text-slate-500" /> : <ChevronRight size={16} className="text-slate-500" />}
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{cnt.name || '未命名'}</span>
          <span className="text-xs text-slate-500 font-mono truncate max-w-[200px]">{cnt.image}</span>
        </div>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            removeContainer(sIdx, cIdx);
          }}
          disabled={isEdit}
          className={`p-1 rounded transition-colors ${isEdit ? 'text-slate-400 cursor-not-allowed' : 'text-red-500 hover:bg-red-100'}`}
        >
          <Trash2 size={14} />
        </button>
      </div>

      {isExpanded && (
        <div className="p-3 border-t border-slate-200 dark:border-slate-700 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">名称</label>
              <input
                type="text"
                disabled={isEdit}
                className={`w-full px-2.5 py-1.5 border border-slate-200 dark:border-slate-600 rounded outline-none text-sm ${isEdit ? 'bg-slate-200 dark:bg-slate-800 text-slate-500 cursor-not-allowed' : 'bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-blue-500'}`}
                value={cnt.name}
                onChange={(e) => updateContainer(sIdx, cIdx, c => ({ ...c, name: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">镜像</label>
              <input
                type="text"
                placeholder="例如 nginx:latest"
                className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded focus:ring-2 focus:ring-blue-500 outline-none text-sm font-mono"
                value={cnt.image}
                onChange={(e) => updateContainer(sIdx, cIdx, c => ({ ...c, image: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">镜像拉取策略</label>
              <select
                className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                value={cnt.imagePullPolicy}
                onChange={(e) => updateContainer(sIdx, cIdx, c => ({ ...c, imagePullPolicy: e.target.value }))}
              >
                <option value="Always">Always</option>
                <option value="IfNotPresent">IfNotPresent</option>
                <option value="Never">Never</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">镜像拉取密钥</label>
              <input
                type="text"
                placeholder="逗号分隔的密钥名称"
                className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded focus:ring-2 focus:ring-blue-500 outline-none text-sm font-mono"
                value={cnt.imagePullSecrets}
                onChange={(e) => updateContainer(sIdx, cIdx, c => ({ ...c, imagePullSecrets: e.target.value }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">副本数</label>
              <input
                type="number"
                min="0"
                className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                value={cnt.replicas}
                onChange={(e) => updateContainer(sIdx, cIdx, c => ({ ...c, replicas: Number(e.target.value) }))}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">最大副本数</label>
              <input
                type="number"
                min={cnt.replicas}
                className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                value={cnt.maxReplicas}
                onChange={(e) => updateContainer(sIdx, cIdx, c => ({ ...c, maxReplicas: Number(e.target.value) }))}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">目标 CPU/内存 (%)</label>
              <div className="flex space-x-2">
                <input
                  type="number"
                  min="1" max="100" placeholder="CPU"
                  className="w-1/2 px-2 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                  value={cnt.targetCpuUtilization || ''}
                  onChange={(e) => updateContainer(sIdx, cIdx, c => ({ ...c, targetCpuUtilization: e.target.value ? Number(e.target.value) : undefined }))}
                />
                <input
                  type="number"
                  min="1" max="100" placeholder="内存"
                  className="w-1/2 px-2 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                  value={cnt.targetMemoryUtilization || ''}
                  onChange={(e) => updateContainer(sIdx, cIdx, c => ({ ...c, targetMemoryUtilization: e.target.value ? Number(e.target.value) : undefined }))}
                />
              </div>
            </div>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-700">
            <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">路由与入口</h4>
            <div className="flex items-center space-x-6">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  checked={cnt.enableService}
                  onChange={(e) => updateContainer(sIdx, cIdx, c => ({ ...c, enableService: e.target.checked }))}
                />
                <span className="text-sm text-slate-600 dark:text-slate-400">启用服务</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  checked={cnt.enableIngress}
                  onChange={(e) => updateContainer(sIdx, cIdx, c => ({ ...c, enableIngress: e.target.checked }))}
                />
                <span className="text-sm text-slate-600 dark:text-slate-400">启用入口</span>
              </label>
              {cnt.enableIngress && (
                <input
                  type="text"
                  placeholder="入口域名 (例如 app.domain.com)"
                  className="flex-1 px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                  value={cnt.ingressDomain}
                  onChange={(e) => updateContainer(sIdx, cIdx, c => ({ ...c, ingressDomain: e.target.value }))}
                />
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">端口</label>
            <div className="space-y-2">
              {cnt.ports.map((p, pIdx) => (
                <div key={pIdx} className="flex items-center space-x-2">
                  <input
                    type="number" min="1" max="65535" placeholder="端口"
                    className="w-24 px-2 py-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded text-sm outline-none"
                    value={p.port || ''}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      updateContainer(sIdx, cIdx, c => {
                        const next = [...c.ports];
                        next[pIdx] = { ...next[pIdx], port: val };
                        return { ...c, ports: next };
                      });
                    }}
                  />
                  <select
                    className="w-20 px-2 py-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded text-sm outline-none"
                    value={p.protocol}
                    onChange={(e) => {
                      const val = e.target.value as 'TCP'|'UDP';
                      updateContainer(sIdx, cIdx, c => {
                        const next = [...c.ports];
                        next[pIdx] = { ...next[pIdx], protocol: val };
                        return { ...c, ports: next };
                      });
                    }}
                  >
                    <option value="TCP">TCP</option>
                    <option value="UDP">UDP</option>
                  </select>
                  <label className="flex items-center space-x-1 text-xs">
                    <input
                      type="checkbox"
                      checked={!!p.enableNodePort}
                      onChange={(e) => {
                        const chk = e.target.checked;
                        updateContainer(sIdx, cIdx, c => {
                          const next = [...c.ports];
                          next[pIdx] = { ...next[pIdx], enableNodePort: chk, nodePort: chk ? next[pIdx].nodePort : undefined };
                          return { ...c, ports: next };
                        });
                      }}
                    />
                    <span>NodePort</span>
                  </label>
                  {p.enableNodePort && (
                    <input
                      type="number" min="30000" max="32767" placeholder="自动"
                      className="w-24 px-2 py-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded text-sm outline-none"
                      value={p.nodePort || ''}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        updateContainer(sIdx, cIdx, c => {
                          const next = [...c.ports];
                          next[pIdx] = { ...next[pIdx], nodePort: val || undefined };
                          return { ...c, ports: next };
                        });
                        if (val >= 30000 && val <= 32767) handleNodePortCheck(val);
                      }}
                    />
                  )}
                  <button type="button" onClick={() => updateContainer(sIdx, cIdx, c => ({ ...c, ports: c.ports.filter((_, i) => i !== pIdx) }))} className="p-1 text-red-500">
                    <X size={16} />
                  </button>
                </div>
              ))}
              <button type="button" onClick={() => updateContainer(sIdx, cIdx, c => ({ ...c, ports: [...c.ports, { port: 8080, protocol: 'TCP' }] }))} className="text-xs text-blue-600 hover:underline">
                + 添加端口
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">环境变量</label>
              {renderKeyValueList(cnt.envList, (l) => updateContainer(sIdx, cIdx, c => ({ ...c, envList: l })))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-medium text-slate-500">资源 (CPU / 内存)</label>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => updateContainer(sIdx, cIdx, c => ({ ...c, requestsCpu: '250m', limitsCpu: '500m', requestsMemory: '256Mi', limitsMemory: '512Mi', resourcePreset: 'Small' }))}
                  className={`text-[10px] px-2 py-0.5 border rounded transition-colors ${cnt.resourcePreset === 'Small' ? 'bg-blue-500 text-white border-blue-600 shadow-sm' : 'bg-slate-100 hover:bg-blue-50 text-slate-600 hover:text-blue-600 border-slate-200 hover:border-blue-200'}`}
                  title="小型: 0.25-0.5 CPU, 256-512MB 内存"
                >
                  小型
                </button>
                <button
                  type="button"
                  onClick={() => updateContainer(sIdx, cIdx, c => ({ ...c, requestsCpu: '500m', limitsCpu: '1000m', requestsMemory: '512Mi', limitsMemory: '1Gi', resourcePreset: 'Medium' }))}
                  className={`text-[10px] px-2 py-0.5 border rounded transition-colors ${cnt.resourcePreset === 'Medium' ? 'bg-blue-500 text-white border-blue-600 shadow-sm' : 'bg-slate-100 hover:bg-blue-50 text-slate-600 hover:text-blue-600 border-slate-200 hover:border-blue-200'}`}
                  title="中型: 0.5-1 CPU, 0.5-1GB 内存"
                >
                  中型
                </button>
                <button
                  type="button"
                  onClick={() => updateContainer(sIdx, cIdx, c => ({ ...c, requestsCpu: '1000m', limitsCpu: '2000m', requestsMemory: '1Gi', limitsMemory: '2Gi', resourcePreset: 'Large' }))}
                  className={`text-[10px] px-2 py-0.5 border rounded transition-colors ${cnt.resourcePreset === 'Large' ? 'bg-blue-500 text-white border-blue-600 shadow-sm' : 'bg-slate-100 hover:bg-blue-50 text-slate-600 hover:text-blue-600 border-slate-200 hover:border-blue-200'}`}
                  title="大型: 1-2 CPU, 1-2GB 内存"
                >
                  大型
                </button>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-2">
              <div className="flex flex-col">
                <label className="text-[10px] text-slate-400 mb-1">请求 CPU</label>
                <input type="text" placeholder="例如 100m" className="px-2 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded text-xs outline-none focus:ring-1 focus:ring-blue-500" value={cnt.requestsCpu} onChange={(e) => updateContainer(sIdx, cIdx, c => ({ ...c, requestsCpu: e.target.value }))} />
              </div>
              <div className="flex flex-col">
                <label className="text-[10px] text-slate-400 mb-1">请求内存</label>
                <input type="text" placeholder="例如 128Mi" className="px-2 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded text-xs outline-none focus:ring-1 focus:ring-blue-500" value={cnt.requestsMemory} onChange={(e) => updateContainer(sIdx, cIdx, c => ({ ...c, requestsMemory: e.target.value }))} />
              </div>
              <div className="flex flex-col">
                <label className="text-[10px] text-slate-400 mb-1">限制 CPU</label>
                <input type="text" placeholder="例如 500m" className="px-2 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded text-xs outline-none focus:ring-1 focus:ring-blue-500" value={cnt.limitsCpu} onChange={(e) => updateContainer(sIdx, cIdx, c => ({ ...c, limitsCpu: e.target.value }))} />
              </div>
              <div className="flex flex-col">
                <label className="text-[10px] text-slate-400 mb-1">限制内存</label>
                <input type="text" placeholder="例如 256Mi" className="px-2 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded text-xs outline-none focus:ring-1 focus:ring-blue-500" value={cnt.limitsMemory} onChange={(e) => updateContainer(sIdx, cIdx, c => ({ ...c, limitsMemory: e.target.value }))} />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">卷挂载</label>
            <ConfigMountSection
              namespace={namespace}
              configMounts={cnt.configMounts}
              setConfigMounts={(cm) => updateContainer(sIdx, cIdx, c => ({ ...c, configMounts: typeof cm === 'function' ? cm(c.configMounts) : cm }))}
              secretMounts={cnt.secretMounts}
              setSecretMounts={(sm) => updateContainer(sIdx, cIdx, c => ({ ...c, secretMounts: typeof sm === 'function' ? sm(c.secretMounts) : sm }))}
            />
          </div>

          <div className="bg-slate-50 dark:bg-slate-900/30 p-4 rounded-xl border border-slate-200 dark:border-slate-700/60">
            <div className="flex items-center justify-between mb-4">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <Network size={16} className="text-blue-500" />
                调度策略
              </label>
              <div className="flex bg-slate-200 dark:bg-slate-800 p-0.5 rounded-lg">
                <button
                  type="button"
                  onClick={() => {
                    if (cnt.schedulingMode === 'advanced') {
                      onConfirmScheduling(sIdx, cIdx);
                    }
                  }}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${cnt.schedulingMode === 'simple' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                >
                  简单
                </button>
                <button
                  type="button"
                  onClick={() => updateContainer(sIdx, cIdx, c => ({ ...c, schedulingMode: 'advanced' }))}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${cnt.schedulingMode === 'advanced' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                >
                  高级
                </button>
              </div>
            </div>

            {cnt.schedulingMode === 'simple' ? (
              <div className="space-y-3">
                <label className={`flex items-start p-3 border rounded-lg cursor-pointer transition-colors ${cnt.simpleStrategy === 'any' ? 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800' : 'bg-white border-slate-200 hover:border-blue-300 dark:bg-slate-800 dark:border-slate-700'}`}>
                  <input type="radio" name={`strategy-${sIdx}-${cIdx}`} className="mt-1" checked={cnt.simpleStrategy === 'any'} onChange={() => updateContainer(sIdx, cIdx, c => ({ ...c, simpleStrategy: 'any' }))} />
                  <div className="ml-3">
                    <div className="text-sm font-medium text-slate-700 dark:text-slate-200">任意工作节点 (默认)</div>
                    <div className="text-xs text-slate-500 mt-0.5">自动调度到任意可用节点。</div>
                  </div>
                </label>

                <label className={`flex items-start p-3 border rounded-lg cursor-pointer transition-colors ${cnt.simpleStrategy === 'fixed' ? 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800' : 'bg-white border-slate-200 hover:border-blue-300 dark:bg-slate-800 dark:border-slate-700'}`}>
                  <input type="radio" name={`strategy-${sIdx}-${cIdx}`} className="mt-1" checked={cnt.simpleStrategy === 'fixed'} onChange={() => updateContainer(sIdx, cIdx, c => ({ ...c, simpleStrategy: 'fixed' }))} />
                  <div className="ml-3 w-full pr-4">
                    <div className="text-sm font-medium text-slate-700 dark:text-slate-200">指定节点</div>
                    <div className="text-xs text-slate-500 mt-0.5 mb-2">将服务固定到指定节点（忽略 Master 污点）。</div>
                    {cnt.simpleStrategy === 'fixed' && (
                      <div className="relative">
                        {loadingNodes ? (
                          <div className="text-xs text-slate-400 mt-2">加载节点中...</div>
                        ) : (
                          <select
                            className="w-full mt-2 px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded text-xs outline-none focus:ring-1 focus:ring-blue-500 appearance-none cursor-pointer"
                            value={cnt.fixedNodeName}
                            onChange={(e) => updateContainer(sIdx, cIdx, c => ({ ...c, fixedNodeName: e.target.value }))}
                            onClick={(e) => e.preventDefault()}
                          >
                            <option value="" disabled>选择节点...</option>
                            {nodeList.map(node => (
                              <option key={node.name} value={node.name}>
                                {node.name} ({node.roles.join(', ') || 'worker'}) - {node.status}
                              </option>
                            ))}
                          </select>
                        )}
                        <div className="absolute right-3 top-1/2 mt-1 -translate-y-1/2 pointer-events-none text-slate-400">
                          <ChevronDown size={14} />
                        </div>
                      </div>
                    )}
                  </div>
                </label>

                <label className={`flex items-start p-3 border rounded-lg cursor-pointer transition-colors ${cnt.simpleStrategy === 'ha' ? 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800' : 'bg-white border-slate-200 hover:border-blue-300 dark:bg-slate-800 dark:border-slate-700'}`}>
                  <input type="radio" name={`strategy-${sIdx}-${cIdx}`} className="mt-1" checked={cnt.simpleStrategy === 'ha'} onChange={() => updateContainer(sIdx, cIdx, c => ({ ...c, simpleStrategy: 'ha' }))} />
                  <div className="ml-3">
                    <div className="text-sm font-medium text-slate-700 dark:text-slate-200">高可用 (反亲和)</div>
                    <div className="text-xs text-slate-500 mt-0.5">将副本分散到不同节点，避免单点故障。</div>
                  </div>
                </label>
              </div>
            ) : (
              <SchedulingSection
                nodeSelectorRows={cnt.nodeSelectorRows}
                onNodeSelectorChange={(rows) => updateContainer(sIdx, cIdx, c => ({ ...c, nodeSelectorRows: rows }))}
                affinityJson={cnt.affinityJson}
                onAffinityChange={(json) => updateContainer(sIdx, cIdx, c => ({ ...c, affinityJson: json }))}
                tolerationsJson={cnt.tolerationsJson}
                onTolerationsChange={(json) => updateContainer(sIdx, cIdx, c => ({ ...c, tolerationsJson: json }))}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
