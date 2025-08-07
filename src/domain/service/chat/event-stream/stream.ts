import { Subject } from 'rxjs'
import { ChatEventStreamMap, IChatEvent, IChatEventStream } from './types'
import { IChat } from '@/domain/entity/chat'
import { randomUUID } from 'crypto'
import { Adapter } from '@/domain/types'

type Params = {
  eventStreamMap: ChatEventStreamMap
} & Adapter

export type Stream = (params: { chat: IChat }) => Promise<IChatEventStream>

export const buildStream =
  ({ eventStreamMap }: Params): Stream =>
  async ({ chat }) => {
    let eventStream: IChatEventStream

    if (chat.id in eventStreamMap) {
      eventStream = eventStreamMap[chat.id]
    } else {
      const eventStreamId = randomUUID()
      const subject = new Subject<IChatEvent>()

      eventStream = {
        id: eventStreamId,
        chat,
        subject,
        close: async ({ subscription }) => {
          subscription.unsubscribe()

          if (!subject.observed) {
            delete eventStreamMap[chat.id]
          }
        },
      }
      eventStreamMap[chat.id] = eventStream
    }

    return eventStream
  }
