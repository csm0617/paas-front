import axios from 'axios';
import type {
  K8sNode,
  Namespace,
  CreateNamespaceRequest,
  DeployCommand,
  Application,
  Result,
  Pod,
  K8sEvent,
  K8sService,
  K8sIngress,
  CreateServiceCommand,
  CreateIngressCommand,
  K8sConfigMap,
  K8sSecret,
  K8sDeployment,
  CreateDeploymentCommand,
} from './types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || error.message || '请求失败';
    return Promise.reject(new Error(message));
  }
);

export const nodeApi = {
  list: async (): Promise<K8sNode[]> => {
    const res = await apiClient.get<Result<K8sNode[]>>(`/nodes`);
    return res.data.data;
  },
  cordon: async (name: string): Promise<void> => {
    await apiClient.post(`/nodes/${name}/cordon`);
  },
  uncordon: async (name: string): Promise<void> => {
    await apiClient.post(`/nodes/${name}/uncordon`);
  }
};


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

export const eventApi = {
  list: async (namespace: string, params?: Record<string, unknown>): Promise<K8sEvent[]> => {
    const res = await apiClient.get<Result<K8sEvent[]>>(`/namespaces/${namespace}/events`, { params });
    return res.data.data;
  },
};

export const applicationApi = {
  getDeployments: async (namespace: string): Promise<Application[]> => {
    const res = await apiClient.get<Result<Application[]>>(`/applications/deployments/${namespace}`);
    return res.data.data;
  },

  deploy: async (command: DeployCommand): Promise<string> => {
    const res = await apiClient.post<Result<string>>(`/applications/deployments`, command);
    return res.data.data;
  },

  scale: async (namespace: string, name: string, serviceName: string, replicas: number): Promise<void> => {
    await apiClient.put(`/applications/deployments/${namespace}/${name}/${serviceName}/scale`, null, {
      params: { replicas },
    });
  },

  updateImage: async (namespace: string, name: string, serviceName: string, containerName: string, image: string): Promise<void> => {
    await apiClient.put(`/applications/deployments/${namespace}/${name}/${serviceName}/${containerName}/image`, null, {
      params: { image },
    });
  },

  scaleWorkload: async (namespace: string, name: string, serviceName: string, workloadName: string, replicas: number): Promise<void> => {
    await apiClient.put(`/applications/deployments/${namespace}/${name}/${serviceName}/${workloadName}/scale`, null, { params: { replicas } });
  },

  updateWorkloadImage: async (namespace: string, name: string, serviceName: string, workloadName: string, image: string): Promise<void> => {
    await apiClient.put(`/applications/deployments/${namespace}/${name}/${serviceName}/${workloadName}/image`, null, { params: { image } });
  },

  restartWorkload: async (namespace: string, name: string, serviceName: string, workloadName: string): Promise<void> => {
    await apiClient.post(`/applications/deployments/${namespace}/${name}/${serviceName}/${workloadName}/restart`);
  },

  rollbackWorkload: async (namespace: string, name: string, serviceName: string, workloadName: string): Promise<void> => {
    await apiClient.post(`/applications/deployments/${namespace}/${name}/${serviceName}/${workloadName}/rollback`);
  },

  getWorkloadYaml: async (namespace: string, name: string, serviceName: string, workloadName: string): Promise<string> => {
    const res = await apiClient.get<Result<string>>(`/applications/deployments/${namespace}/${name}/${serviceName}/${workloadName}/yaml`);
    return res.data.data;
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

  restart: async (namespace: string, name: string, serviceName: string): Promise<void> => {
    await apiClient.post(`/applications/deployments/${namespace}/${name}/${serviceName}/restart`);
  },

  rollback: async (namespace: string, name: string, serviceName: string): Promise<void> => {
    await apiClient.post(`/applications/deployments/${namespace}/${name}/${serviceName}/rollback`);
  },

  getLogs: async (namespace: string, name: string, serviceName: string, tailLines: number = 100): Promise<string> => {
    const res = await apiClient.get<Result<string>>(`/applications/deployments/${namespace}/${name}/${serviceName}/logs`, {
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

  getYaml: async (namespace: string, name: string): Promise<string> => {
    const res = await apiClient.get<Result<string>>(`/applications/deployments/${namespace}/${name}/yaml`);
    return res.data.data;
  },
  getServiceYaml: async (namespace: string, name: string, serviceName: string): Promise<string> => {
    const res = await apiClient.get<Result<string>>(`/applications/deployments/${namespace}/${name}/${serviceName}/yaml`);
    return res.data.data;
  },

  checkNodePort: async (port: number): Promise<boolean> => {
    const res = await apiClient.get<Result<boolean>>(`/applications/ports/check-nodeport`, {
      params: { port },
    });
    return res.data.data;
  },
};

export const networkApi = {
  listServices: async (namespace: string): Promise<K8sService[]> => {
    const res = await apiClient.get<Result<K8sService[]>>(`/namespaces/${namespace}/services`);
    return res.data.data;
  },
  getService: async (namespace: string, name: string): Promise<K8sService> => {
    const res = await apiClient.get<Result<K8sService>>(`/namespaces/${namespace}/services/${name}`);
    return res.data.data;
  },
  createService: async (namespace: string, command: CreateServiceCommand): Promise<K8sService> => {
    const res = await apiClient.post<Result<K8sService>>(`/namespaces/${namespace}/services`, command);
    return res.data.data;
  },
  deleteService: async (namespace: string, name: string): Promise<void> => {
    await apiClient.delete(`/namespaces/${namespace}/services/${name}`);
  },
  listIngresses: async (namespace: string): Promise<K8sIngress[]> => {
    const res = await apiClient.get<Result<K8sIngress[]>>(`/namespaces/${namespace}/ingresses`);
    return res.data.data;
  },
  getIngress: async (namespace: string, name: string): Promise<K8sIngress> => {
    const res = await apiClient.get<Result<K8sIngress>>(`/namespaces/${namespace}/ingresses/${name}`);
    return res.data.data;
  },
  createIngress: async (namespace: string, command: CreateIngressCommand): Promise<K8sIngress> => {
    const res = await apiClient.post<Result<K8sIngress>>(`/namespaces/${namespace}/ingresses`, command);
    return res.data.data;
  },
  deleteIngress: async (namespace: string, name: string): Promise<void> => {
    await apiClient.delete(`/namespaces/${namespace}/ingresses/${name}`);
  }
};

export const configMapApi = {
  list: async (namespace: string): Promise<K8sConfigMap[]> => {
    const res = await apiClient.get<Result<K8sConfigMap[]>>(`/namespaces/${namespace}/configmaps`);
    return res.data.data;
  },
  get: async (namespace: string, name: string): Promise<K8sConfigMap> => {
    const res = await apiClient.get<Result<K8sConfigMap>>(`/namespaces/${namespace}/configmaps/${name}`);
    return res.data.data;
  },
  create: async (namespace: string, configMap: { name: string; data: Record<string, string> }): Promise<K8sConfigMap> => {
    const res = await apiClient.post<Result<K8sConfigMap>>(`/namespaces/${namespace}/configmaps`, configMap);
    return res.data.data;
  },
  update: async (namespace: string, name: string, configMap: { data: Record<string, string> }): Promise<K8sConfigMap> => {
    const res = await apiClient.put<Result<K8sConfigMap>>(`/namespaces/${namespace}/configmaps/${name}`, configMap);
    return res.data.data;
  },
  delete: async (namespace: string, name: string): Promise<void> => {
    await apiClient.delete(`/namespaces/${namespace}/configmaps/${name}`);
  }
};

export const secretApi = {
  list: async (namespace: string): Promise<K8sSecret[]> => {
    const res = await apiClient.get<Result<K8sSecret[]>>(`/namespaces/${namespace}/secrets`);
    return res.data.data;
  },
  get: async (namespace: string, name: string): Promise<K8sSecret> => {
    const res = await apiClient.get<Result<K8sSecret>>(`/namespaces/${namespace}/secrets/${name}`);
    return res.data.data;
  },
  create: async (namespace: string, secret: { name: string; data: Record<string, string> }): Promise<K8sSecret> => {
    const res = await apiClient.post<Result<K8sSecret>>(`/namespaces/${namespace}/secrets`, secret);
    return res.data.data;
  },
  update: async (namespace: string, name: string, secret: { data: Record<string, string> }): Promise<K8sSecret> => {
    const res = await apiClient.put<Result<K8sSecret>>(`/namespaces/${namespace}/secrets/${name}`, secret);
    return res.data.data;
  },
  delete: async (namespace: string, name: string): Promise<void> => {
    await apiClient.delete(`/namespaces/${namespace}/secrets/${name}`);
  }
};

export const deploymentApi = {
  list: async (namespace: string): Promise<K8sDeployment[]> => {
    const res = await apiClient.get<Result<K8sDeployment[]>>(`/namespaces/${namespace}/deployments`);
    return res.data.data;
  },
  create: async (namespace: string, request: CreateDeploymentCommand): Promise<K8sDeployment> => {
    const res = await apiClient.post<Result<K8sDeployment>>(`/namespaces/${namespace}/deployments`, request);
    return res.data.data;
  },
  scale: async (namespace: string, name: string, replicas: number): Promise<void> => {
    await apiClient.put(`/namespaces/${namespace}/deployments/${name}/scale`, null, {
      params: { replicas },
    });
  },
  updateImage: async (namespace: string, name: string, image: string): Promise<void> => {
    await apiClient.put(`/namespaces/${namespace}/deployments/${name}/image`, null, {
      params: { image },
    });
  },
  restart: async (namespace: string, name: string): Promise<void> => {
    await apiClient.post(`/namespaces/${namespace}/deployments/${name}/restart`);
  },
  delete: async (namespace: string, name: string): Promise<void> => {
    await apiClient.delete(`/namespaces/${namespace}/deployments/${name}`);
  }
};

export type {
  EnvVar,
  ResourceQuotaSpec,
  LimitRangeSpec,
  NetworkPolicySpec,
  Namespace,
  CreateNamespaceRequest,
  ProbeSpec,
  PortSpec,
  ConfigMount,
  SecretMount,
  ContainerSpec,
  ApplicationService,
  DeployCommand,
  Application,
  Result,
  K8sTaint,
  K8sNode,
  Pod,
  K8sEvent,
  K8sService,
  K8sIngress,
  CreateServiceCommand,
  CreateIngressCommand,
  K8sConfigMap,
  K8sSecret,
  K8sDeployment,
  CreateDeploymentCommand,
} from './types';
