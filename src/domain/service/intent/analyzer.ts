import { AnalysisFeatures, AnalysisResult } from './types'
import { buildSystemPrompt } from './prompt'
import { logger } from '@/lib/logger'
import { getErrorString } from '@/lib'

interface LLMConfig {
  model: string
  temperature: number
  maxTokens: number
  responseFormat?: any
}

interface ResponseParser {
  parse(content: string): AnalysisResult
  getDefaultValues(): AnalysisResult
}

export class IntentAnalyzer {
  constructor(
    private gateway: any,
    private features: AnalysisFeatures,
    private config: LLMConfig,
    private parser: ResponseParser
  ) {}

  async analyze(message: string, messageHistory?: string): Promise<AnalysisResult> {
    const systemPrompt = buildSystemPrompt(
      {
        needIntent: this.features.intent || false,
        needContext: this.features.context || false,
        needComplexity: this.features.complexity || false
      },
      messageHistory,
      message
    )

    logger.info('LLM intent analysis request', {
      location: 'intent.analyze',
      model: this.config.model,
      features: this.features,
      systemPrompt,
      userMessage: message,
    })

    try {
      const response = await this.gateway.sync({
        messages: [{ role: 'user', content: message }],
        settings: {
          model: this.config.model,
          temperature: this.config.temperature,
          max_tokens: this.config.maxTokens,
          system_prompt: systemPrompt,
        },
        response_format: this.config.responseFormat,
      })

      const result = this.parser.parse(response.message.content)
      result.tokensUsed = response.usage?.total_tokens || 0

      return result
    } catch (error) {
      logger.error('Failed to analyze intent', {
        message: getErrorString(error),
        location: 'intent.analyze',
      })
      
      // Возвращаем дефолтные значения при ошибке
      return this.parser.getDefaultValues()
    }
  }
} 