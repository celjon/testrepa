import { Observable } from 'rxjs'
import { Stream } from 'openai/streaming'
import { ChatCompletionChunk } from 'openai/resources'

export type ModelUsage = {
  prompt_tokens: number
  completion_tokens: number
  total_tokens: number
}

export type Chunk = {
  status: 'pending' | 'done'
  value: string
  reasoningValue: string | null
  usage: ModelUsage | null
  vision?: boolean
}

export class SendObservable extends Observable<Chunk> {
  constructor(
    public readonly stream: Stream<ChatCompletionChunk>,
    ...observableParams: ConstructorParameters<typeof Observable<Chunk>>
  ) {
    super(...observableParams)
  }
}

export type RawStreamChunk = ChatCompletionChunk

export type RawStream = Observable<RawStreamChunk>
