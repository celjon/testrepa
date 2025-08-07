import { IntentType } from '@/domain/entity/intent'
import { zodResponseFormat } from 'openai/helpers/zod'
import { z } from 'zod'

export const intentResponseSchema = z.object({
  intent: z.nativeEnum(IntentType),
})

export const intentResponseFormat = zodResponseFormat(intentResponseSchema, 'Intent')

// Типы для внутреннего использования
export type AnalysisFeatures = {
  intent?: boolean
  context?: boolean
  complexity?: boolean
}

// Внутренний результат анализа
export type AnalysisResult = {
  intent?: IntentType
  context_reset_needed?: boolean
  complexity?: ComplexityType
  tokensUsed?: number
}

export type ComplexityType = 'simple' | 'complex'

// Публичный тип ответа API
export type IntentAnalysisResponse = {
  type: IntentType
  transcript?: string
  context_reset_needed?: boolean
  model_complexity?: ComplexityType
}
