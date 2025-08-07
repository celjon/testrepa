import { UseCaseParams } from '@/domain/usecase/types'
import { buildCompletionsSync, CompletionsSync } from './completions.sync'
import { buildCompletionsStream, CompletionsStream } from './completions.stream'

export type AIToolsUseCase = {
  completions: {
    sync: CompletionsSync
    stream: CompletionsStream
  }
}
export const buildAIToolsUseCase = (params: UseCaseParams): AIToolsUseCase => {
  return {
    completions: {
      sync: buildCompletionsSync(params),
      stream: buildCompletionsStream(params),
    },
  }
}
