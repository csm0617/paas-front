export interface EnvVar {
  [key: string]: string;
}

export interface ResourceQuotaSpec {
  hard: Record<string, string>;
}

export interface LimitRangeSpec {
  defaultLimits: Record<string, string>;
  defaultRequests: Record<string, string>;
}

export interface NetworkPolicySpec {
  ingressRules: string[];
  egressRules: string[];
}

export interface Namespace {
  name: string;
  status?: string;
  labels?: Record<string, string>;
  resourceQuotaSpec?: ResourceQuotaSpec;
  limitRangeSpec?: LimitRangeSpec;
  networkPolicySpec?: NetworkPolicySpec;
}

export interface CreateNamespaceRequest {
  name: string;
  labels?: Record<string, string>;
  resourceQuotaSpec?: ResourceQuotaSpec;
  limitRangeSpec?: LimitRangeSpec;
  networkPolicySpec?: NetworkPolicySpec;
}

export interface ProbeSpec {
  path: string;
  port: number;
  initialDelaySeconds: number;
  periodSeconds: number;
}

export interface PortSpec {
  port: number;
  protocol: 'TCP' | 'UDP';
  enableNodePort?: boolean;
  nodePort?: number;
}

export interface ConfigMount {
  mountPath: string;
  subPath: boolean;
  configMapName: string;
  key: string;
  defaultMode?: number;
}

export interface SecretMount {
  mountPath: string;
  subPath: boolean;
  secretName: string;
  key: string;
  defaultMode?: number;
}

export interface ContainerSpec {
  name: string;
  image: string;
  imagePullPolicy?: string;
  imagePullSecrets?: string[];
  port?: number;
  ports?: PortSpec[];
  env?: EnvVar;
  configs?: EnvVar;
  secrets?: EnvVar;
  configMounts?: ConfigMount[];
  secretMounts?: SecretMount[];
  livenessProbe?: ProbeSpec;
  readinessProbe?: ProbeSpec;
  requestsCpu?: string;
  requestsMemory?: string;
  limitsCpu?: string;
  limitsMemory?: string;

  replicas?: number;
  maxReplicas?: number;
  targetCpuUtilization?: number;
  targetMemoryUtilization?: number;
  enableService?: boolean;
  serviceType?: string;
  enableIngress?: boolean;
  ingressDomain?: string;
  nodeSelector?: Record<string, string>;
  affinityJson?: string;
  tolerationsJson?: string;
}

export interface ApplicationService {
  name: string;
  replicas: number;
  maxReplicas: number;
  targetCpuUtilization?: number;
  targetMemoryUtilization?: number;
  enableService?: boolean;
  serviceType?: string;
  enableIngress?: boolean;
  ingressDomain?: string;
  nodeSelector?: Record<string, string>;
  affinityJson?: string;
  tolerationsJson?: string;
  containers: ContainerSpec[];
  status?: string;
}

export interface DeployCommand {
  name: string;
  namespace: string;
  description?: string;
  services: ApplicationService[];
}

export interface Application {
  id: string;
  name: string;
  namespace: string;
  description?: string;
  services: ApplicationService[];
  status: 'PENDING' | 'RUNNING' | 'FAILED' | 'DELETED' | 'STOPPED';
}

export interface Result<T> {
  code: number;
  message: string;
  data: T;
}

export interface K8sTaint {
  key: string;
  value: string;
  effect: string;
}

export interface K8sNode {
  name: string;
  status: string;
  roles: string[];
  kubeletVersion: string;
  osImage: string;
  internalIp: string;
  externalIp: string;
  cpuCapacity: string;
  memoryCapacity: string;
  podCapacity: string;
  cpuAllocatable: string;
  memoryAllocatable: string;
  podAllocatable: string;
  labels: Record<string, string>;
  taints: K8sTaint[];
  unschedulable: boolean;
}

export interface Pod {
  name: string;
  namespace: string;
  status: string;
  phase?: string;
  reason?: string;
  message?: string;
  nodeName: string;
  podIP: string;
  startTime: string;
  restarts: number;
}

export interface K8sEvent {
  namespace?: string;
  name?: string;
  type?: string;
  reason?: string;
  message?: string;
  involvedObjectKind?: string;
  involvedObjectName?: string;
  lastTimestamp?: string;
  eventTime?: string;
}

export interface ServicePort {
  name?: string;
  port: number;
  targetPort?: number;
  nodePort?: number;
  protocol?: string;
}

export interface K8sService {
  name: string;
  namespace: string;
  type: string;
  clusterIP: string;
  externalIPs?: string[];
  ports: ServicePort[];
  selector?: Record<string, string>;
}

export interface K8sIngress {
  name: string;
  namespace: string;
  hosts: string[];
  paths: string[];
  loadBalancerIPs?: string[];
}

export interface CreateServiceCommand {
  name: string;
  type: string;
  ports: ServicePort[];
  selector: Record<string, string>;
}

export interface IngressRuleDto {
  host: string;
  path: string;
  pathType: string;
  serviceName: string;
  servicePort: number;
}

export interface CreateIngressCommand {
  name: string;
  rules: IngressRuleDto[];
}

export interface K8sConfigMap {
  name: string;
  namespace: string;
  data: Record<string, string>;
  creationTimestamp?: string;
}

export interface K8sSecret {
  name: string;
  namespace: string;
  data: Record<string, string>;
  creationTimestamp?: string;
}

export interface K8sDeployment {
  name: string;
  namespace: string;
  image: string;
  replicas: number;
  availableReplicas: number;
  status: string;
  creationTimestamp?: string;
}

export interface CreateDeploymentCommand {
  name: string;
  image: string;
  port: number;
  replicas: number;
  requestsCpu?: string;
  requestsMemory?: string;
  limitsCpu?: string;
  limitsMemory?: string;
  nodeSelector?: Record<string, string>;
  affinityJson?: string;
  tolerationsJson?: string;
}
