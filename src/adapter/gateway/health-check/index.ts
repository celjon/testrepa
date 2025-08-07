import cluster from 'node:cluster'
import type { AdapterParams } from '@/adapter/types'
import type { ClusterGateway } from '../cluster'
import {
  buildOnEventLoopLagRequest,
  buildOnEventLoopUtilizationRequest,
  buildOnMemoryUsageRequest,
} from './producers'
import { IHealthCheckEvent, MetricSources } from './types'
import { buildGetMetricFromCluster } from './get-metric-from-cluster'

type Params = Pick<AdapterParams, 'db'> & {
  clusterGateway: ClusterGateway
}

export type HealthCheckGateway = ReturnType<typeof buildHealthCheckGateway>

export const buildHealthCheckGateway = ({ db, clusterGateway }: Params) => {
  const onMemoryUsageRequest = buildOnMemoryUsageRequest()
  const onEventLoopLagRequest = buildOnEventLoopLagRequest()
  const onEventLoopUtilizationRequest = buildOnEventLoopUtilizationRequest()

  const metricSources: MetricSources = {
    MEMORY_USAGE: onMemoryUsageRequest,
    EVENT_LOOP_LAG: onEventLoopLagRequest,
    EVENT_LOOP_UTILIZATION: onEventLoopUtilizationRequest,
  }

  const pendingRequests = new Map<string, (event: IHealthCheckEvent) => void>()

  return {
    init: () => {
      if (cluster.isPrimary) {
        const workersToListen = clusterGateway.getWorkers()

        // Handle messages from workers
        clusterGateway.on(
          'health-check',
          (event) => {
            const requestingWorkerId = event.sourceWorkerId
            const workers = clusterGateway.getWorkers()

            if (event.type === 'worker:collectMetrics') {
              for (const targetWorker of workers) {
                if (targetWorker.id !== requestingWorkerId) {
                  clusterGateway.emit('health-check', targetWorker, {
                    ...event,
                    type: 'primary:collectMetrics',
                  })
                }
              }

              const requestingWorker = workers.find((worker) => worker.id === requestingWorkerId)

              if (requestingWorker) {
                clusterGateway.emit('health-check', requestingWorker, {
                  type: 'primary:metricsResponse',
                  requestId: event.requestId,
                  sourceProcessId: process.pid,
                  sourceWorkerId: 0,
                  targetWorkerId: requestingWorkerId,
                  metric: {
                    name: event.metric.name,
                    data: metricSources[event.metric.name](),
                  },
                } as IHealthCheckEvent)
              }
            } else if (event.type === 'worker:metricsResponse') {
              // Handle response from a worker and forward it to the requesting worker
              const requestingWorker = workers.find((worker) => worker.id === event.targetWorkerId)

              if (requestingWorker) {
                clusterGateway.emit('health-check', requestingWorker, {
                  ...event,
                  type: 'primary:metricsResponse',
                })
              }
            }
          },
          workersToListen,
        )
      } else {
        // Handle messages from primary
        clusterGateway.on('health-check', (event) => {
          if (event.type === 'primary:collectMetrics' && event.requestId) {
            // Send response back via primary
            clusterGateway.emit('health-check', null, {
              type: 'worker:metricsResponse',
              requestId: event.requestId,
              sourceProcessId: process.pid,
              sourceWorkerId: cluster.worker?.id,
              targetWorkerId: event.sourceWorkerId,
              metric: {
                name: event.metric.name,
                data: metricSources[event.metric.name](),
              },
            } as IHealthCheckEvent)
          }
          if (event.type === 'primary:metricsResponse') {
            const request = pendingRequests.get(event.requestId)

            if (request) {
              request(event)
            }
          }
        })
      }
    },
    checkDB: async () => {
      await db.client.$executeRaw`SELECT 1;`
      return {
        status: 'ok',
        message: 'Database connection is healthy',
      }
    },
    getEventLoopLag: buildGetMetricFromCluster({
      clusterGateway,
      pendingRequests,
      metricSource: metricSources.EVENT_LOOP_LAG,
      metricName: 'EVENT_LOOP_LAG',
    }),
    getEventLoopUtilization: buildGetMetricFromCluster({
      clusterGateway,
      pendingRequests,
      metricSource: metricSources.EVENT_LOOP_UTILIZATION,
      metricName: 'EVENT_LOOP_UTILIZATION',
    }),
    getMemoryUsage: buildGetMetricFromCluster({
      clusterGateway,
      pendingRequests,
      metricSource: metricSources.MEMORY_USAGE,
      metricName: 'MEMORY_USAGE',
    }),
  }
}
