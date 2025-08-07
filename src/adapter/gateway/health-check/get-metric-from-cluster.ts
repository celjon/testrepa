import cluster from 'node:cluster'
import { nanoid } from 'nanoid'
import { workerCount } from '@/config'
import { logger } from '@/lib/logger'
import { getErrorString } from '@/lib'
import { IHealthCheckEvent, IHealthCheckMetricsResponse, MetricSources } from './types'
import { ClusterGateway } from '../cluster'

export const buildGetMetricFromCluster = <MetricName extends keyof MetricSources>({
  pendingRequests,
  clusterGateway,
  metricName,
  metricSource,
}: {
  pendingRequests: Map<string, (event: IHealthCheckEvent) => void>
  clusterGateway: ClusterGateway
  metricName: MetricName
  metricSource: MetricSources[MetricName]
}) => {
  return () =>
    new Promise<{
      [pid: string]: ReturnType<MetricSources[MetricName]>
    }>((resolve, reject) => {
      const requestId = nanoid()
      const metrics: {
        [pid: string]: ReturnType<MetricSources[MetricName]>
      } = {}
      let responsesReceived = 1

      const timeoutId = setTimeout(() => {
        if (responsesReceived < workerCount + 1) {
          logger.warn({
            location: 'getMetricFromCluster',
            message: `${metricName} Only received ${responsesReceived}/${workerCount + 1} responses`,
          })
        }
        cleanup()
        resolve(metrics)
      }, 3000)

      const cleanup = () => {
        clearTimeout(timeoutId)
        pendingRequests.delete(requestId)
      }

      try {
        metrics[process.pid] = metricSource() as ReturnType<MetricSources[MetricName]>

        pendingRequests.set(requestId, (event: IHealthCheckEvent) => {
          if (isMatchingMetricResponse(event, metricName, requestId)) {
            metrics[event.sourceProcessId] = event.metric.data

            responsesReceived++

            if (responsesReceived === workerCount + 1) {
              cleanup()
              resolve(metrics)
            }
          }
        })

        // Request data from other workers via primary
        clusterGateway.emit('health-check', null, {
          type: 'worker:collectMetrics',
          requestId,
          sourceWorkerId: cluster.worker?.id || 0,
          metric: {
            name: metricName,
          },
        })
      } catch (error) {
        cleanup()
        reject(error)
        logger.error({
          location: 'getMetricFromCluster',
          metricName,
          message: getErrorString(error),
        })
      }
    })
}

function isMatchingMetricResponse<MetricName extends keyof MetricSources>(
  event: IHealthCheckEvent,
  metricName: MetricName,
  requestId: string,
): event is IHealthCheckMetricsResponse<MetricName> {
  return (
    event.requestId === requestId &&
    event.targetWorkerId === (cluster.worker?.id || 0) &&
    event.type === 'primary:metricsResponse' &&
    event.metric.name === metricName
  )
}
