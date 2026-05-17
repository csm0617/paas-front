import type { DeployCommand } from '@/lib/types';
import type { FormState } from '@/hooks/useDeployForm';
import { toMap } from '@/lib/utils';

export function buildDeployCommand(formState: FormState): DeployCommand {
  return {
    name: formState.name,
    namespace: formState.namespace,
    description: formState.description,
    services: formState.services.map(s => {
      return {
        name: s.name,
        replicas: s.containers[0]?.replicas ?? 1,
        maxReplicas: s.containers[0]?.maxReplicas ?? 1,
        targetCpuUtilization: s.containers[0]?.targetCpuUtilization,
        targetMemoryUtilization: s.containers[0]?.targetMemoryUtilization,
        enableService: s.containers[0]?.enableService ?? true,
        serviceType: s.containers[0]?.serviceType ?? 'ClusterIP',
        enableIngress: s.containers[0]?.enableIngress ?? false,
        ingressDomain: s.containers[0]?.ingressDomain ?? '',
        nodeSelector: toMap(s.containers[0]?.nodeSelectorRows ?? []),
        affinityJson: s.containers[0]?.affinityJson ?? '',
        tolerationsJson: s.containers[0]?.tolerationsJson ?? '',
        containers: s.containers.map(c => {
          let finalNodeSelectorRows = c.nodeSelectorRows;
          let finalAffinityJson = c.affinityJson;
          let finalTolerationsJson = c.tolerationsJson;

          if (c.schedulingMode === 'simple') {
            finalNodeSelectorRows = [];
            finalAffinityJson = '';
            finalTolerationsJson = '';

            if (c.simpleStrategy === 'fixed' && c.fixedNodeName) {
              finalAffinityJson = JSON.stringify({
                nodeAffinity: {
                  requiredDuringSchedulingIgnoredDuringExecution: {
                    nodeSelectorTerms: [{
                      matchExpressions: [{
                        key: 'kubernetes.io/hostname',
                        operator: 'In',
                        values: [c.fixedNodeName]
                      }]
                    }]
                  }
                }
              });
              finalTolerationsJson = JSON.stringify([{ operator: 'Exists' }]);
            } else if (c.simpleStrategy === 'ha') {
              finalAffinityJson = JSON.stringify({
                podAntiAffinity: {
                  preferredDuringSchedulingIgnoredDuringExecution: [{
                    weight: 100,
                    podAffinityTerm: {
                      labelSelector: {
                        matchExpressions: [{
                          key: 'paas.csm.com/service',
                          operator: 'In',
                          values: [s.name]
                        }]
                      },
                      topologyKey: 'kubernetes.io/hostname'
                    }
                  }]
                }
              });
            }
          }

          const mainPort = c.ports[0]?.port;
          return {
            name: c.name,
            image: c.image,
            imagePullPolicy: c.imagePullPolicy,
            imagePullSecrets: c.imagePullSecrets ? c.imagePullSecrets.split(',').map(s => s.trim()).filter(Boolean) : [],
            port: mainPort,
            ports: c.ports.map(p => ({
              port: p.port,
              protocol: p.protocol,
              enableNodePort: p.enableNodePort,
              nodePort: p.nodePort
            })),
            env: toMap(c.envList),
            configs: toMap(c.configList),
            secrets: toMap(c.secretList),
            configMounts: c.configMounts.filter(cm => cm.configMapName && cm.mountPath && (!cm.subPath || cm.key)),
            secretMounts: c.secretMounts.filter(sm => sm.secretName && sm.mountPath && (!sm.subPath || sm.key)),
            livenessProbe: mainPort ? { path: '/healthz', port: mainPort, initialDelaySeconds: 15, periodSeconds: 10 } : undefined,
            readinessProbe: mainPort ? { path: '/ready', port: mainPort, initialDelaySeconds: 5, periodSeconds: 10 } : undefined,
            requestsCpu: c.requestsCpu || undefined,
            requestsMemory: c.requestsMemory || undefined,
            limitsCpu: c.limitsCpu || undefined,
            limitsMemory: c.limitsMemory || undefined,
            replicas: c.replicas,
            maxReplicas: c.maxReplicas,
            targetCpuUtilization: c.targetCpuUtilization,
            targetMemoryUtilization: c.targetMemoryUtilization,
            enableService: c.enableService,
            serviceType: c.serviceType,
            enableIngress: c.enableIngress,
            ingressDomain: c.ingressDomain,
            nodeSelector: toMap(finalNodeSelectorRows),
            affinityJson: finalAffinityJson,
            tolerationsJson: finalTolerationsJson,
          };
        })
      };
    })
  };
}
