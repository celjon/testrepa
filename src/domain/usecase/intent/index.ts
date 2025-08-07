import { UseCaseParams } from '@/domain/usecase/types'
import { buildDetermine, DetermineIntent } from './analyze'

export type IntentUseCase = {
  determine: DetermineIntent
}

export const buildIntentUseCase = (params: UseCaseParams): IntentUseCase => {
  return {
    determine: buildDetermine(params),
  }
}
