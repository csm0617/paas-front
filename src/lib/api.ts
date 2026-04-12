import axios from 'axios';

// Configure your backend base URL here or in .env
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

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

export interface DeployCommand {
  name: string;
  namespace: string;
  image: string;
  port: number;
  replicas: number;
  maxReplicas: number;
  env: EnvVar;
  configs?: EnvVar;
  secrets?: EnvVar;
  livenessProbe?: ProbeSpec;
  readinessProbe?: ProbeSpec;
  targetCpuUtilization?: number;
  targetMemoryUtilization?: number;
}

export interface ApplicationDeployment {
  id: string;
  name: string;
  namespace: string;
  image: string;
  replicas: number;
  status: 'PENDING' | 'RUNNING' | 'FAILED' | 'DELETED' | 'STOPPED';
}

export interface Result<T> {
  code: number;
  message: string;
  data: T;
}

export const namespaceApi = {
  list: async (): Promise<Namespace[]> => {
    const res = await apiClient.get<Result<Namespace[]>>(`/namespaces/`);
    return res.data.data;
  },
  get: async (name: string): Promise<Namespace> => {
    const res = await apiClient.get<Result<Namespace>>(`/namespaces/${name}`);
    return res.data.data;
  },
  create: async (request: CreateNamespaceRequest): Promise<Namespace> => {
    const res = await apiClient.post<Result<Namespace>>(`/namespaces/`, request);
    return res.data.data;
  },
  delete: async (name: string): Promise<void> => {
    await apiClient.delete(`/namespaces/${name}`);
  },
};

export interface Pod {
  name: string;
  namespace: string;
  status: string;
  nodeName: string;
  podIP: string;
  startTime: string;
  restarts: number;
}

export const podApi = {
  list: async (namespace: string, labels?: Record<string, string>): Promise<Pod[]> => {
    const res = await apiClient.get<Result<Pod[]>>(`/namespaces/${namespace}/pods`, { params: labels });
    return res.data.data;
  },
  get: async (namespace: string, name: string): Promise<Pod> => {
    const res = await apiClient.get<Result<Pod>>(`/namespaces/${namespace}/pods/${name}`);
    return res.data.data;
  },
  delete: async (namespace: string, name: string): Promise<void> => {
    await apiClient.delete(`/namespaces/${namespace}/pods/${name}`);
  },
  getLogs: async (namespace: string, name: string, tailLines: number = 100): Promise<string> => {
    const res = await apiClient.get<Result<string>>(`/namespaces/${namespace}/pods/${name}/logs`, {
      params: { tailLines },
    });
    return res.data.data;
  },
  getTerminalUrl: async (namespace: string, name: string): Promise<string> => {
    const res = await apiClient.get<Result<string>>(`/namespaces/${namespace}/pods/${name}/terminal`);
    return res.data.data;
  }
};

export const api = {
  getDeployments: async (namespace: string): Promise<ApplicationDeployment[]> => {
    const res = await apiClient.get<Result<ApplicationDeployment[]>>(`/applications/deployments/${namespace}`);
    return res.data.data;
  },

  deploy: async (command: DeployCommand): Promise<string> => {
    const res = await apiClient.post<Result<string>>(`/applications/deployments`, command);
    return res.data.data;
  },

  scale: async (namespace: string, name: string, replicas: number): Promise<void> => {
    await apiClient.put(`/applications/deployments/${namespace}/${name}/scale`, null, {
      params: { replicas },
    });
  },

  updateImage: async (namespace: string, name: string, image: string): Promise<void> => {
    await apiClient.put(`/applications/deployments/${namespace}/${name}/image`, null, {
      params: { image },
    });
  },

  delete: async (namespace: string, name: string): Promise<void> => {
    await apiClient.delete(`/applications/deployments/${namespace}/${name}`);
  },

  stop: async (namespace: string, name: string): Promise<void> => {
    await apiClient.post(`/applications/deployments/${namespace}/${name}/stop`);
  },

  start: async (namespace: string, name: string): Promise<void> => {
    await apiClient.post(`/applications/deployments/${namespace}/${name}/start`);
  },

  restart: async (namespace: string, name: string): Promise<void> => {
    await apiClient.post(`/applications/deployments/${namespace}/${name}/restart`);
  },

  rollback: async (namespace: string, name: string): Promise<void> => {
    await apiClient.post(`/applications/deployments/${namespace}/${name}/rollback`);
  },

  getLogs: async (namespace: string, name: string, tailLines: number = 100): Promise<string> => {
    const res = await apiClient.get<Result<string>>(`/applications/deployments/${namespace}/${name}/logs`, {
      params: { tailLines },
    });
    return res.data.data;
  },

  getTerminalUrl: async (namespace: string, name: string, podName: string): Promise<string> => {
    const res = await apiClient.get<Result<string>>(`/applications/deployments/${namespace}/${name}/terminal`, {
      params: { podName },
    });
    return res.data.data;
  },
};
