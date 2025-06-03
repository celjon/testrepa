import { Worker } from 'node:cluster'
import { OnMessage } from './onMessage'
import { ProcessEventMap } from './types'

type Params = {
  onMessage: OnMessage
}

export const buildOn = ({ onMessage }: Params) =>
  function On<EventName extends keyof ProcessEventMap>(
    eventName: EventName,
    event: ProcessEventMap[EventName],
    worker?: Worker | Worker[]
  ) {
    return onMessage((message) => {
      if (message.eventName !== eventName) {
        return
      }

      // @ts-ignore
      event(...message.eventParams)
    }, worker)
  }

export type On = ReturnType<typeof buildOn>
