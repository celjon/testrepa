import { AnalysisFeatures } from './types'
import { IntentOnlyParser, FullAnalysisParser, ResponseParser } from './strategy'
import { intentResponseFormat } from './types'
import { IntentAnalyzer } from './analyzer'

interface LLMConfig {
  model: string
  temperature: number
  maxTokens: number
  responseFormat?: any
}

export class IntentAnalyzerBuilder {
  private features: AnalysisFeatures = {}
  private config: LLMConfig = {
    model: 'gpt-4.1-mini',
    temperature: 0.1,
    maxTokens: 20
  }
  private parser!: ResponseParser

  withIntent(): this {
    this.features.intent = true
    this.updateConfig()
    return this
  }

  withContext(): this {
    this.features.context = true
    this.updateConfig()
    return this
  }

  withComplexity(): this {
    this.features.complexity = true
    this.updateConfig()
    return this
  }

  withModel(model: string): this {
    this.config.model = model
    return this
  }

  private updateConfig(): void {
    const featureCount = Object.values(this.features).filter(Boolean).length
    
    // Динамически подстраиваем max_tokens в зависимости от количества features
    if (featureCount === 1) {
      this.config.maxTokens = 20
    } else if (featureCount === 2) {
      this.config.maxTokens = 50
    } else {
      this.config.maxTokens = 60
    }
  }

  build(gateway: any): IntentAnalyzer {
    // Выбираем подходящий парсер
    if (Object.values(this.features).filter(Boolean).length === 1 && this.features.intent) {
      this.parser = new IntentOnlyParser()
      this.config.responseFormat = intentResponseFormat
    } else {
      this.parser = new FullAnalysisParser(this.features)
      this.config.responseFormat = { type: 'json_object' }
    }

    return new IntentAnalyzer(gateway, this.features, this.config, this.parser)
  }
} 