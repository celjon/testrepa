import { IMessage } from '@/domain/entity/message'
import { Subject, Subscription } from 'rxjs'
import { IChat } from './chat'
import { IJob } from './job'
import { IChatSettings } from './chat-settings'
import { ITransaction } from './transaction'
import { ISubscription } from './subscription'

export interface IChatUpdateEvent {
  name: 'UPDATE'
  data: {
    chat: Partial<IChat>
  }
}

export interface IChatDeleteEvent {
  name: 'DELETE' | 'DELETE_MANY'
}

export interface IChatSettingsUpdateEvent {
  name: 'SETTINGS_UPDATE'
  data: {
    settings: Partial<IChatSettings>
  }
}

export interface IChatMessageCreateEvent {
  name: 'MESSAGE_CREATE'
  data: {
    message: IMessage
  }
}

export interface IChatMessageRecreateEvent {
  name: 'MESSAGE_RECREATE'
  data: {
    oldMessage: IMessage
    newMessage: IMessage
  }
}

export interface IChatMessageUpdateEvent {
  name: 'MESSAGE_UPDATE'
  data: {
    message: {
      id: string
    } & Partial<IMessage>
  }
}

export type IChatJobEvent = {
  name:
    | 'JOB_CREATE'
    | 'JOB_START'
    | 'JOB_STOP'
    | 'JOB_PROGRESS'
    | 'JOB_ERROR'
    | 'JOB_DONE'
    | 'JOB_UPDATE'
    | 'JOB_DELETE'
  data: {
    job: IJob
  }
}

export interface IChatTransactionCreateEvent {
  name: 'TRANSACTION_CREATE'
  data: {
    transaction: ITransaction
  }
}

export interface IChatSubscriptionUpdateEvent {
  name: 'SUBSCRIPTION_UPDATE'
  data: {
    subscription: {
      id: string
    } & Partial<ISubscription>
  }
}

export interface IChatEnterpriseSubscriptionUpdateEvent {
  name: 'ENTERPRISE_SUBSCRIPTION_UPDATE'
  data: {
    subscription: {
      id: string
    } & Partial<ISubscription>
  }
}

/**
 * @openapi
 * components:
 *   entities:
 *      ChatEvent:
 *          required:
 *            - id
 *            - name
 *            - data
 *          properties:
 *            id:
 *              type: string
 *            name:
 *              type: string
 *              enum: ['MESSAGE_CREATE', 'MESSAGE_RECREATE', 'MESSAGE_UPDATE', 'JOB_CREATE', 'TRANSACTION_CREATE', 'SUBSCRIPTION_UPDATE', 'ENTERPRISE_SUBSCRIPTION_UPDATE']
 *            data:
 *              type: object
 */
export type IChatEvent =
  | IChatUpdateEvent
  | IChatDeleteEvent
  | IChatSettingsUpdateEvent
  | IChatMessageCreateEvent
  | IChatMessageRecreateEvent
  | IChatMessageUpdateEvent
  | IChatJobEvent
  | IChatTransactionCreateEvent
  | IChatSubscriptionUpdateEvent
  | IChatEnterpriseSubscriptionUpdateEvent

export type ChatEventName = IChatEvent['name']

export type ChatCloseEventStreamFunction = (options: { subscription: Subscription }) => void

export interface IChatEventStream {
  id: string
  chat: IChat
  subject: Subject<IChatEvent>
  close: ChatCloseEventStreamFunction
}

export type ChatEventStreamMap = Record<string, IChatEventStream>
