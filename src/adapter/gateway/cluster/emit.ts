import { Worker } from 'node:cluster'
import { ProcessEventMap } from './types'
import { Send } from './send'

type Params = {
  send: Send
}

export type Emit<EventName extends keyof ProcessEventMap = keyof ProcessEventMap> = (
  eventName: EventName,
  worker: Worker | Worker[] | null,
  ...eventParams: Parameters<ProcessEventMap[EventName]>
) => void

export const buildEmit =
  ({ send }: Params): Emit =>
  (eventName, worker, ...eventParams) =>
    send({
      worker,
      message: {
        eventName,
        eventParams
      }
    })
