import React, { useState } from 'react';
import { ChevronDown, ChevronRight, FileJson, FileCode, FileText, Copy, CheckCircle } from 'lucide-react';

interface YAMLTab {
  id: string;
  label: string;
  icon: React.ElementType;
  content: string;
}

const deploymentYaml = `apiVersion: apps/v1
kind: Deployment
metadata:
  name: reviews-v1
  namespace: mall-system
spec:
  replicas: 3
  selector:
    matchLabels:
      app: reviews
      version: v1
  template:
    metadata:
      labels:
        app: reviews
        version: v1
    spec:
      containers:
      - name: reviews
        image: reviews:v1.0.0
        ports:
        - containerPort: 8080
        resources:
          requests:
            cpu: "500m"
            memory: "512Mi"
          limits:
            cpu: "1"
            memory: "1Gi"`;

const serviceYaml = `apiVersion: v1
kind: Service
metadata:
  name: reviews-svc
  namespace: mall-system
spec:
  selector:
    app: reviews
  ports:
  - port: 8080
    targetPort: 8080
    name: http`;

const ingressYaml = `apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: mall-ingress
  namespace: mall-system
spec:
  rules:
  - host: api.mall.com
    http:
      paths:
      - path: /reviews
        pathType: Prefix
        backend:
          service:
            name: reviews-svc
            port:
              number: 8080`;

const tabs: YAMLTab[] = [
  { id: 'deployment', label: 'Deployment YAML', icon: FileJson, content: deploymentYaml },
  { id: 'service', label: 'Service YAML', icon: FileCode, content: serviceYaml },
  { id: 'ingress', label: 'Ingress YAML', icon: FileText, content: ingressYaml },
];

interface ExpertModePanelProps {
  defaultOpen?: boolean;
}

export default function ExpertModePanel({ defaultOpen = false }: ExpertModePanelProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [activeTab, setActiveTab] = useState('deployment');
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const activeContent = tabs.find(t => t.id === activeTab)?.content || '';
    navigator.clipboard.writeText(activeContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
      {/* 折叠头部 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors"
      >
        <div className="flex items-center space-x-3">
          {isOpen ? <ChevronDown size={18} className="text-slate-400" /> : <ChevronRight size={18} className="text-slate-400" />}
          <span className="font-semibold text-slate-800 dark:text-slate-200">Expert Mode</span>
          <span className="px-2 py-0.5 text-[10px] font-medium bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-md">K8s YAML</span>
        </div>
      </button>

      {/* 展开内容 */}
      {isOpen && (
        <div className="border-t border-slate-100 dark:border-slate-700">
          {/* Tab 切换 */}
          <div className="flex border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/30">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-1.5 px-4 py-3 text-xs font-medium border-b-2 transition-all ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400 bg-white dark:bg-slate-800'
                    : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                <tab.icon size={14} />
                <span>{tab.label}</span>
              </button>
            ))}
            <div className="flex-1" />
            <button
              onClick={handleCopy}
              className="flex items-center space-x-1 px-4 py-3 text-xs text-slate-500 hover:text-blue-600 transition-colors"
            >
              {copied ? <CheckCircle size={14} className="text-green-500" /> : <Copy size={14} />}
              <span>{copied ? '已复制' : '复制'}</span>
            </button>
          </div>

          {/* YAML 内容 */}
          <pre className="p-4 overflow-x-auto text-xs font-mono leading-relaxed bg-slate-900 text-slate-200 max-h-80 overflow-y-auto">
            <code>{tabs.find(t => t.id === activeTab)?.content}</code>
          </pre>
        </div>
      )}
    </div>
  );
}
