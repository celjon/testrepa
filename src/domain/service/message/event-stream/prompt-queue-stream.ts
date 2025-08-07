import { Subject } from 'rxjs'
import { IPromptQueueEvent, IPromptQueueEventStream, PromptQueueStreamMap } from './types'

type Params = {
  promptEventStreamMap: PromptQueueStreamMap
}
export type PromptQueueStream = (params: { queueId: string }) => Promise<IPromptQueueEventStream>
export const buildPromptQueueStream =
  ({ promptEventStreamMap }: Params): PromptQueueStream =>
  async ({ queueId }) => {
    if (promptEventStreamMap[queueId]) {
      return promptEventStreamMap[queueId]
    }

    const subject = new Subject<IPromptQueueEvent>()

    const stream: IPromptQueueEventStream = {
      id: queueId,
      subject,
      close: async ({ subscription }) => {
        subscription.unsubscribe()
        if (!subject.observed) {
          delete promptEventStreamMap[queueId]
        }
      },
    }

    promptEventStreamMap[queueId] = stream
    return stream
  }
