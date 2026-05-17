export interface Revision {
  version: string;
  image: string;
  replicas: number;
  traffic: number;
  status: 'Running' | 'Ready' | 'Failed';
}

export interface ServiceDetail {
  name: string;
  description: string;
  qps: string;
  error: string;
  cpu: string;
  memory: string;
  currentRevision: string;
  revisions: Revision[];
  type: 'internal' | 'entry';
  status: 'Healthy' | 'Warning' | 'Critical';
  boundApps: string[];
}

export const APP_DESCRIPTIONS: Record<string, string> = {
  'mall-system': '商城系统',
  'payment-system': '支付系统',
  'user-center': '用户中心',
  'data-platform': '数据平台',
};

export const APP_NAMES = Object.keys(APP_DESCRIPTIONS);

export const SERVICE_STORE: Record<string, ServiceDetail> = {
  reviews: {
    name: 'reviews',
    description: '评论服务',
    qps: '2.1k',
    error: '0.05%',
    cpu: '31%',
    memory: '45%',
    currentRevision: 'v1',
    type: 'internal',
    status: 'Healthy',
    boundApps: ['mall-system'],
    revisions: [
      { version: 'v1', image: 'reviews:v1.0.0', replicas: 3, traffic: 100, status: 'Running' },
      { version: 'v2', image: 'reviews:v2.0.0', replicas: 0, traffic: 0, status: 'Ready' },
    ],
  },
  payment: {
    name: 'payment',
    description: '支付服务',
    qps: '800',
    error: '0.3%',
    cpu: '22%',
    memory: '38%',
    currentRevision: 'v2',
    type: 'internal',
    status: 'Healthy',
    boundApps: ['mall-system'],
    revisions: [
      { version: 'v1', image: 'payment:v1.2.0', replicas: 0, traffic: 0, status: 'Ready' },
      { version: 'v2', image: 'payment:v2.0.0', replicas: 2, traffic: 100, status: 'Running' },
    ],
  },
  'user-center': {
    name: 'user-center',
    description: '用户中心服务',
    qps: '5.2k',
    error: '0.15%',
    cpu: '55%',
    memory: '40%',
    currentRevision: 'v1',
    type: 'internal',
    status: 'Warning',
    boundApps: ['mall-system'],
    revisions: [
      { version: 'v1', image: 'user-center:v1.0.0', replicas: 3, traffic: 100, status: 'Running' },
    ],
  },
  notification: {
    name: 'notification',
    description: '通知服务',
    qps: '300',
    error: '0.01%',
    cpu: '8%',
    memory: '15%',
    currentRevision: 'v1',
    type: 'internal',
    status: 'Healthy',
    boundApps: ['mall-system'],
    revisions: [
      { version: 'v1', image: 'notification:v1.0.0', replicas: 1, traffic: 100, status: 'Running' },
    ],
  },
  order: {
    name: 'order',
    description: '订单服务',
    qps: '1.5k',
    error: '0.08%',
    cpu: '35%',
    memory: '50%',
    currentRevision: 'v1',
    type: 'internal',
    status: 'Healthy',
    boundApps: ['mall-system'],
    revisions: [
      { version: 'v1', image: 'order:v1.0.0', replicas: 2, traffic: 100, status: 'Running' },
    ],
  },
  gateway: {
    name: 'gateway',
    description: 'API 网关',
    qps: '12.3k',
    error: '0.01%',
    cpu: '45%',
    memory: '62%',
    currentRevision: 'v2',
    type: 'entry',
    status: 'Healthy',
    boundApps: ['mall-system', 'payment-system'],
    revisions: [
      { version: 'v1', image: 'gateway:v1.5.0', replicas: 1, traffic: 30, status: 'Running' },
      { version: 'v2', image: 'gateway:v2.0.0', replicas: 2, traffic: 70, status: 'Running' },
    ],
  },
  'payment-core': {
    name: 'payment-core',
    description: '支付核心服务',
    qps: '1.8k',
    error: '0.02%',
    cpu: '28%',
    memory: '35%',
    currentRevision: 'v2',
    type: 'internal',
    status: 'Healthy',
    boundApps: ['payment-system'],
    revisions: [
      { version: 'v1', image: 'payment-core:v1.0.0', replicas: 0, traffic: 0, status: 'Ready' },
      { version: 'v2', image: 'payment-core:v2.0.0', replicas: 3, traffic: 100, status: 'Running' },
    ],
  },
  settlement: {
    name: 'settlement',
    description: '结算服务',
    qps: '600',
    error: '0.03%',
    cpu: '18%',
    memory: '28%',
    currentRevision: 'v1',
    type: 'internal',
    status: 'Healthy',
    boundApps: ['payment-system'],
    revisions: [
      { version: 'v1', image: 'settlement:v1.0.0', replicas: 2, traffic: 100, status: 'Running' },
    ],
  },
  'billing-gateway': {
    name: 'billing-gateway',
    description: '计费网关',
    qps: '800',
    error: '0.04%',
    cpu: '12%',
    memory: '22%',
    currentRevision: 'v1',
    type: 'entry',
    status: 'Healthy',
    boundApps: ['payment-system'],
    revisions: [
      { version: 'v1', image: 'billing-gateway:v1.0.0', replicas: 1, traffic: 100, status: 'Running' },
    ],
  },
  auth: {
    name: 'auth',
    description: '认证服务',
    qps: '3.5k',
    error: '0.1%',
    cpu: '42%',
    memory: '36%',
    currentRevision: 'v1',
    type: 'internal',
    status: 'Warning',
    boundApps: ['user-center'],
    revisions: [
      { version: 'v1', image: 'auth:v1.0.0', replicas: 2, traffic: 100, status: 'Running' },
    ],
  },
  profile: {
    name: 'profile',
    description: '用户资料服务',
    qps: '1.7k',
    error: '0.02%',
    cpu: '15%',
    memory: '20%',
    currentRevision: 'v1',
    type: 'internal',
    status: 'Healthy',
    boundApps: ['user-center'],
    revisions: [
      { version: 'v1', image: 'profile:v1.0.0', replicas: 1, traffic: 100, status: 'Running' },
    ],
  },
  'data-api': {
    name: 'data-api',
    description: '数据 API 服务',
    qps: '1.1k',
    error: '0.06%',
    cpu: '25%',
    memory: '30%',
    currentRevision: 'v1',
    type: 'internal',
    status: 'Healthy',
    boundApps: ['data-platform'],
    revisions: [
      { version: 'v1', image: 'data-api:v1.0.0', replicas: 1, traffic: 100, status: 'Running' },
    ],
  },
};

export function getServicesByApp(appName: string): ServiceDetail[] {
  return Object.values(SERVICE_STORE).filter(s => s.boundApps.includes(appName));
}

export function getServiceByName(name: string): ServiceDetail | undefined {
  return SERVICE_STORE[name];
}
