import { IPromptQueueEvent } from '@/domain/entity/prompt-queue-event'
import { IHealthCheckEvent } from '../health-check/types'
import { IChatEvent } from '@/domain/entity/chat-event'

export interface ProcessEventMap {
  'chat-emit': (chatId: string, event: IChatEvent) => any
  'prompt-queue-emit': (chatId: string, event: IPromptQueueEvent) => any
  'job-stop': (jobId: string) => any
  'mj-synchronize': () => any
  'mj-next': () => any
  'health-check': (event: IHealthCheckEvent) => any
}

export interface IProcessMessage<EventName extends keyof ProcessEventMap = keyof ProcessEventMap> {
  eventName: EventName
  eventParams: Parameters<ProcessEventMap[EventName]>
}
