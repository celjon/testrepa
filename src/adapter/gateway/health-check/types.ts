export type HealthCheckMetricName = 'MEMORY_USAGE' | 'EVENT_LOOP_LAG' | 'EVENT_LOOP_UTILIZATION'

export type HealthCheckClusterEvent =
  | 'worker:collectMetrics' // Worker → Primary: Worker requests metrics from all workers through sending event to Primary
  | 'primary:collectMetrics' // Primary -> Worker: Primary forwarding the collection request
  | 'worker:metricsResponse' // Worker → Primary: Worker sends its metrics to primary
  | 'primary:metricsResponse' // Primary → Worker: Primary forwards collected metrics to requesting worker

export type IHealthCheckEvent =
  | {
      type: 'worker:collectMetrics' | 'primary:collectMetrics'
      requestId: string
      sourceProcessId?: undefined
      sourceWorkerId: number
      targetWorkerId?: undefined
      metric: {
        name: HealthCheckMetricName
      }
    }
  | IHealthCheckMetricsResponse<HealthCheckMetricName>

export type IHealthCheckMetricsResponse<MetricName extends keyof MetricSources> = {
  type: 'worker:metricsResponse' | 'primary:metricsResponse'
  requestId: string
  sourceProcessId: number
  sourceWorkerId: number
  targetWorkerId: number
  metric: {
    name: MetricName
    data: ReturnType<MetricSources[MetricName]>
  }
}

export type MetricSources = {
  MEMORY_USAGE: () => {
    isPrimary: boolean
    heapUsedBytes: number
    heapTotalBytes: number
    rssBytes: number
  }
  EVENT_LOOP_LAG: () => {
    isPrimary: boolean
    lag: number
  }
  EVENT_LOOP_UTILIZATION: () => {
    isPrimary: boolean
    utilization: number
  }
}
