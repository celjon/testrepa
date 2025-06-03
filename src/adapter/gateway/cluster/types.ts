import { IChatEvent } from '@/domain/entity/chatEvent'
import { IHealthCheckEvent } from '../health-check/types'

export interface ProcessEventMap {
  'chat-emit': (chatId: string, event: IChatEvent) => any
  'job-stop': (jobId: string) => any
  'mj-synchronize': () => any
  'mj-next': () => any
  'health-check': (event: IHealthCheckEvent) => any
}

export interface IProcessMessage<EventName extends keyof ProcessEventMap = keyof ProcessEventMap> {
  eventName: EventName
  eventParams: Parameters<ProcessEventMap[EventName]>
}
