import { useEffect, useMemo, useState, useCallback } from 'react';
import { applicationApi, nodeApi } from '@/lib/api';
import type { ConfigMount, SecretMount, K8sNode, Application } from '@/lib/types';
import { useNamespaceStore } from '@/store/namespaceStore';
import { fromMap, validateJson } from '@/lib/utils';

export interface PortSpecState {
  port: number;
  protocol: 'TCP' | 'UDP';
  enableNodePort?: boolean;
  nodePort?: number;
}

export interface ContainerState {
  id: string;
  name: string;
  image: string;
  imagePullPolicy: string;
  imagePullSecrets: string;
  ports: PortSpecState[];
  envList: { key: string; value: string }[];
  configList: { key: string; value: string }[];
  secretList: { key: string; value: string }[];
  configMounts: ConfigMount[];
  secretMounts: SecretMount[];
  requestsCpu: string;
  requestsMemory: string;
  limitsCpu: string;
  limitsMemory: string;
  resourcePreset?: 'Small' | 'Medium' | 'Large';

  replicas: number;
  maxReplicas: number;
  targetCpuUtilization?: number;
  targetMemoryUtilization?: number;
  enableService: boolean;
  serviceType: string;
  enableIngress: boolean;
  ingressDomain: string;
  schedulingMode: 'simple' | 'advanced';
  simpleStrategy: 'any' | 'fixed' | 'ha';
  fixedNodeName: string;
  nodeSelectorRows: { key: string; value: string }[];
  affinityJson: string;
  tolerationsJson: string;
}

export interface ServiceState {
  id: string;
  name: string;
  containers: ContainerState[];
}

export interface FormState {
  name: string;
  namespace: string;
  description: string;
  services: ServiceState[];
}

export const generateId = () => Math.random().toString(36).substring(7);

export const initialContainer = (): ContainerState => ({
  id: generateId(),
  name: 'main',
  image: '',
  imagePullPolicy: 'Always',
  imagePullSecrets: '',
  ports: [{ port: 80, protocol: 'TCP' }],
  envList: [],
  configList: [],
  secretList: [],
  configMounts: [],
  secretMounts: [],
  requestsCpu: '',
  requestsMemory: '',
  limitsCpu: '',
  limitsMemory: '',
  replicas: 1,
  maxReplicas: 1,
  targetCpuUtilization: 80,
  targetMemoryUtilization: 80,
  enableService: true,
  serviceType: 'ClusterIP',
  enableIngress: false,
  ingressDomain: '',
  schedulingMode: 'simple',
  simpleStrategy: 'any',
  fixedNodeName: '',
  nodeSelectorRows: [],
  affinityJson: '',
  tolerationsJson: '',
});

export const initialService = (): ServiceState => ({
  id: generateId(),
  name: 'web',
  containers: [initialContainer()],
});

interface UseDeployFormOptions {
  isOpen: boolean;
  initialApp?: Application | null;
  initialServiceName?: string | null;
}

export function useDeployForm({ isOpen, initialApp, initialServiceName }: UseDeployFormOptions) {
  const { namespaces, fetchNamespaces, listLoading: namespacesLoading, currentNamespace } = useNamespaceStore();

  const [formState, setFormState] = useState<FormState>({
    name: '',
    namespace: currentNamespace || 'default',
    description: '',
    services: [initialService()],
  });

  const [expandedServices, setExpandedServices] = useState<Set<string>>(new Set());
  const [expandedContainers, setExpandedContainers] = useState<Set<string>>(new Set());
  const [nodePortStatus, setNodePortStatus] = useState<Record<number, { checking: boolean; available: boolean | null }>>({});
  const [nodeList, setNodeList] = useState<K8sNode[]>([]);
  const [loadingNodes, setLoadingNodes] = useState(false);

  const namespaceOptions = useMemo(() => {
    return namespaces.length > 0 ? namespaces.map((ns) => ns.name) : ['default', 'kube-system', 'monitoring'];
  }, [namespaces]);

  useEffect(() => {
    if (!isOpen) return;
    setNodePortStatus({});

    if (initialApp && initialServiceName) {
      const svc = initialApp.services.find(s => s.name === initialServiceName);
      if (svc) {
        setFormState({
          name: initialApp.name,
          namespace: initialApp.namespace,
          description: initialApp.description || '',
          services: [{
            id: generateId(),
            name: svc.name,
            containers: svc.containers.map(c => ({
              id: generateId(),
              name: c.name,
              image: c.image,
              imagePullPolicy: c.imagePullPolicy || 'Always',
              imagePullSecrets: c.imagePullSecrets?.join(', ') || '',
              ports: c.ports?.map(p => ({
                port: p.port,
                protocol: (p.protocol as 'TCP' | 'UDP') || 'TCP',
                enableNodePort: p.enableNodePort,
                nodePort: p.nodePort
              })) || [{ port: c.port || 80, protocol: 'TCP' }],
              envList: fromMap(c.env),
              configList: fromMap(c.configs),
              secretList: fromMap(c.secrets),
              configMounts: c.configMounts || [],
              secretMounts: c.secretMounts || [],
              requestsCpu: c.requestsCpu || '',
              requestsMemory: c.requestsMemory || '',
              limitsCpu: c.limitsCpu || '',
              limitsMemory: c.limitsMemory || '',
              replicas: c.replicas ?? svc.replicas,
              maxReplicas: c.maxReplicas ?? c.replicas ?? svc.maxReplicas ?? svc.replicas,
              targetCpuUtilization: c.targetCpuUtilization ?? svc.targetCpuUtilization,
              targetMemoryUtilization: c.targetMemoryUtilization ?? svc.targetMemoryUtilization,
              enableService: c.enableService ?? svc.enableService ?? false,
              serviceType: c.serviceType ?? svc.serviceType ?? 'ClusterIP',
              enableIngress: c.enableIngress ?? svc.enableIngress ?? false,
              ingressDomain: c.ingressDomain ?? svc.ingressDomain ?? '',
              schedulingMode: 'advanced',
              simpleStrategy: 'any',
              fixedNodeName: '',
              nodeSelectorRows: fromMap(c.nodeSelector ?? svc.nodeSelector),
              affinityJson: c.affinityJson ?? svc.affinityJson ?? '',
              tolerationsJson: c.tolerationsJson ?? svc.tolerationsJson ?? '',
            }))
          }]
        });
      }
    } else {
      setFormState((prev) => ({
        ...prev,
        name: '',
        description: '',
        namespace: currentNamespace || prev.namespace,
        services: [initialService()]
      }));
    }

    if (namespaces.length === 0 && !namespacesLoading) {
      fetchNamespaces();
    }

    setLoadingNodes(true);
    nodeApi.list().then(nodes => {
      setNodeList(nodes);
      setLoadingNodes(false);
    }).catch(() => {
      setLoadingNodes(false);
    });
  }, [isOpen, initialApp, initialServiceName, currentNamespace, fetchNamespaces, namespaces.length, namespacesLoading]);

  useEffect(() => {
    if (!isOpen) return;
    if (initialApp) return;
    if (!formState.namespace) return;
    if (!namespaceOptions.includes(formState.namespace)) {
      setFormState((prev) => ({ ...prev, namespace: '' }));
    }
  }, [isOpen, initialApp, formState.namespace, namespaceOptions]);

  const toggleService = useCallback((id: string) => {
    setExpandedServices(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleContainer = useCallback((id: string) => {
    setExpandedContainers(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const updateService = useCallback((sIdx: number, updater: (s: ServiceState) => ServiceState) => {
    setFormState(prev => {
      const next = [...prev.services];
      next[sIdx] = updater(next[sIdx]);
      return { ...prev, services: next };
    });
  }, []);

  const updateContainer = useCallback((sIdx: number, cIdx: number, updater: (c: ContainerState) => ContainerState) => {
    updateService(sIdx, s => {
      const nextC = [...s.containers];
      nextC[cIdx] = updater(nextC[cIdx]);
      return { ...s, containers: nextC };
    });
  }, [updateService]);

  const handleNodePortCheck = useCallback(async (port: number) => {
    if (!port || port < 30000 || port > 32767) return;
    setNodePortStatus(prev => ({ ...prev, [port]: { checking: true, available: null } }));
    try {
      const available = await applicationApi.checkNodePort(port);
      setNodePortStatus(prev => ({ ...prev, [port]: { checking: false, available } }));
    } catch {
      setNodePortStatus(prev => ({ ...prev, [port]: { checking: false, available: null } }));
    }
  }, []);

  const getStepError = useCallback((currentStep: number) => {
    if (currentStep === 0) {
      if (!formState.name?.trim()) return '应用名称不能为空';
      if (!formState.namespace?.trim()) return 'Namespace 不能为空';
    }

    if (currentStep === 1) {
      if (formState.services.length === 0) return '至少需要一个 Service';

      const nodePorts = new Set<number>();
      for (const s of formState.services) {
        if (!s.name?.trim()) return 'Service 名称不能为空';
        if (s.containers.length === 0) return `Service ${s.name} 至少需要一个 Container`;

        for (const c of s.containers) {
          if (!c.name?.trim()) return `Container 名称不能为空 (in Service ${s.name})`;
          if (!c.image?.trim()) return `Container ${c.name} 镜像不能为空`;

          if (!Number.isFinite(c.replicas) || c.replicas < 0) return `Container ${c.name} Replicas 不能小于 0`;
          if (!Number.isFinite(c.maxReplicas) || c.maxReplicas < c.replicas) return `Container ${c.name} Max Replicas 不能小于 Replicas`;
          if (c.enableIngress && !c.ingressDomain?.trim()) return `Container ${c.name} 启用 Ingress 时必须填写域名`;

          if (validateJson(c.affinityJson)) return `Container ${c.name} affinityJson 格式错误`;
          if (validateJson(c.tolerationsJson)) return `Container ${c.name} tolerationsJson 格式错误`;

          for (const p of c.ports) {
            if (!Number.isFinite(p.port) || p.port < 1 || p.port > 65535) return `Container ${c.name} 端口必须在 1-65535 之间`;
            if (p.enableNodePort && p.nodePort !== undefined) {
              if (p.nodePort < 30000 || p.nodePort > 32767) return `NodePort 必须在 30000-32767 之间`;
              if (nodePorts.has(p.nodePort)) return `NodePort ${p.nodePort} 在当前表单中重复配置`;
              nodePorts.add(p.nodePort);
              if (nodePortStatus[p.nodePort]?.available === false) return `NodePort ${p.nodePort} 已被占用`;
            }
          }
        }
      }
    }

    return null;
  }, [formState, nodePortStatus]);

  const validateStep = useCallback((currentStep: number) => {
    if (currentStep === 2) {
      for (let i = 0; i < 2; i++) {
        const err = getStepError(i);
        if (err) return { valid: false, error: err, jumpTo: i };
      }
      return { valid: true, error: null, jumpTo: null };
    }

    const err = getStepError(currentStep);
    if (err) return { valid: false, error: err, jumpTo: null };
    return { valid: true, error: null, jumpTo: null };
  }, [getStepError]);

  return {
    formState,
    setFormState,
    expandedServices,
    expandedContainers,
    nodePortStatus,
    nodeList,
    loadingNodes,
    namespaceOptions,
    toggleService,
    toggleContainer,
    updateService,
    updateContainer,
    handleNodePortCheck,
    getStepError,
    validateStep,
  };
}
