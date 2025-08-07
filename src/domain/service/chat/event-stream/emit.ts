import { Adapter } from '@/domain/types'
import { IChat } from '@/domain/entity/chat'
import { ChatEventStreamMap, IChatEvent, IChatEventStream } from './types'
import { devMode } from '@/config'

type Params = {
  eventStreamMap: ChatEventStreamMap
} & Pick<Adapter, 'clusterGateway'>

type EmitType = 'stream' | 'process'

export type Emit = (params: {
  chat?: IChat
  chatId?: string
  event: IChatEvent
  type?: EmitType
}) => IChatEventStream | null

export const buildEmit =
  ({ eventStreamMap, clusterGateway }: Params): Emit =>
  ({ event, type = 'process', ...params }) => {
    const chatId: string | null = params.chat?.id ?? params.chatId ?? null

    if (!chatId) {
      return null
    }

    if (!devMode && type === 'process') {
      clusterGateway.emit('chat-emit', null, chatId, event)

      return null
    }

    if (!(chatId in eventStreamMap)) {
      return null
    }

    const eventStream: IChatEventStream = eventStreamMap[chatId]

    eventStream.subject.next(event)

    return eventStream
  }
