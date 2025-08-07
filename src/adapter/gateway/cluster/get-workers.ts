import cluster, { Worker } from 'node:cluster'

export type GetWorkers = () => Worker[]

export const buildGetWorkers = (): GetWorkers => () => {
  const workers: Worker[] = []

  for (const workerId in cluster.workers) {
    const worker = cluster.workers[workerId]

    if (!worker || !worker.isConnected) {
      continue
    }

    workers.push(worker)
  }

  return workers
}
