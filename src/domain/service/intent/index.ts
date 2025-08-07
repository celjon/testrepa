import { Adapter } from '@/domain/types'
import { IntentType } from '@/domain/entity/intent'
import { IntentAnalyzerBuilder } from './builder'
import { AnalysisResult } from './types'

export type IntentService = {
  analyze: (params: {
    message: string
    messageHistory?: string
    features: {
      intent?: boolean
      context?: boolean
      complexity?: boolean
    }
  }) => Promise<AnalysisResult>
}

export const buildIntentService = (adapter: Adapter): IntentService => {
  const analyze = async (params: {
    message: string
    messageHistory?: string
    features: {
      intent?: boolean
      context?: boolean
      complexity?: boolean
    }
  }): Promise<AnalysisResult> => {
    // Создаем анализатор с нужными features
    const builder = new IntentAnalyzerBuilder()
    
    // По умолчанию intent анализ включен, если явно не отключен
    if (params.features.intent !== false) {
      builder.withIntent()
    }
    if (params.features.context) {
      builder.withContext()
    }
    if (params.features.complexity) {
      builder.withComplexity()
    }
    
    const analyzer = builder.build(adapter.openrouterGateway)
    const result = await analyzer.analyze(params.message, params.messageHistory)
    
    // Возвращаем только нужные поля
    return {
      intent: result.intent || IntentType.TEXT,
      ...(result.context_reset_needed !== undefined ? { context_reset_needed: result.context_reset_needed } : {}),
      ...(result.complexity ? { complexity: result.complexity } : {}),
      ...(result.tokensUsed ? { tokensUsed: result.tokensUsed } : {})
    }
  }

  return { analyze }
}
