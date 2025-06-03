import cluster from 'node:cluster'
import { MetricSources } from './types'

export const buildOnMemoryUsageRequest = (): MetricSources['MEMORY_USAGE'] => () => {
  const used = process.memoryUsage()
  return {
    isPrimary: cluster.isPrimary,
    heapUsedBytes: used.heapUsed, // Your app data
    heapTotalBytes: used.heapTotal, // V8 reserved
    rssBytes: used.rss // Total process size
  }
}

export const buildOnEventLoopLagRequest = (): MetricSources['EVENT_LOOP_LAG'] => () => {
  return {
    isPrimary: cluster.isPrimary,
    lag: 42
  }
}

export const buildOnEventLoopUtilizationRequest = (): MetricSources['EVENT_LOOP_UTILIZATION'] => () => {
  return {
    isPrimary: cluster.isPrimary,
    utilization: 42
  }
}
