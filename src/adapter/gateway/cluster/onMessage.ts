import { Worker } from 'node:cluster'
import { IProcessMessage } from './types'

// adds event listener on process or specified worker(s)
export type OnMessage = (listener: (message: IProcessMessage) => unknown, worker?: Worker | Worker[]) => void

export const buildOnMessage = (): OnMessage => (listener, worker) => {
  if (typeof worker === 'undefined' || (Array.isArray(worker) && worker.length === 0)) {
    process.on('message', (message: any) => {
      listener(JSON.parse(message))
    })
  } else if (Array.isArray(worker)) {
    const workers = worker

    for (const worker of workers) {
      worker.on('message', (message: any) => {
        listener(JSON.parse(message))
      })
    }
  } else {
    worker.on('message', (message: any) => listener(JSON.parse(message)))
  }
}
