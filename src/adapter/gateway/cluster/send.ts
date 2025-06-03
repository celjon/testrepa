import { Worker } from 'node:cluster'
import { IProcessMessage } from './types'

export type Send = (params: { worker?: Worker | Worker[] | null; message: IProcessMessage }) => void

export const buildSend =
  (): Send =>
  ({ worker, message }) => {
    if (!worker) {
      if (process.send) {
        process.send?.(JSON.stringify(message))
      } else {
        process.emit('message', JSON.stringify(message), null)
      }
    } else if (Array.isArray(worker)) {
      const workers = worker

      for (const worker of workers) {
        worker.send(JSON.stringify(message))
      }
    } else {
      worker.send(JSON.stringify(message))
    }
  }
