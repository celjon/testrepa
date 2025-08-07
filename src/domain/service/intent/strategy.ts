import { IntentType } from '@/domain/entity/intent'
import { AnalysisResult, AnalysisFeatures } from './types'

export interface ResponseParser {
  parse(content: string): AnalysisResult
  getDefaultValues(): AnalysisResult
}

export class IntentOnlyParser implements ResponseParser {
  parse(content: string): AnalysisResult {
    const data = JSON.parse(content)
    return {
      intent: data.intent || IntentType.TEXT
    }
  }

  getDefaultValues(): AnalysisResult {
    return {
      intent: IntentType.TEXT
    }
  }
}

export class FullAnalysisParser implements ResponseParser {
  private features: AnalysisFeatures

  constructor(features: AnalysisFeatures) {
    this.features = features
  }

  parse(content: string): AnalysisResult {
    const data = JSON.parse(content)
    const result: AnalysisResult = {}

    if (this.features.intent) {
      result.intent = data.intent || IntentType.TEXT
    }

    if (this.features.context) {
      result.context_reset_needed = data.context_reset_needed || false
    }

    if (this.features.complexity) {
      result.complexity = data.complexity || 'simple'
    }

    return result
  }

  getDefaultValues(): AnalysisResult {
    const defaults: AnalysisResult = {}
    
    if (this.features.intent) {
      defaults.intent = IntentType.TEXT
    }
    if (this.features.context) {
      defaults.context_reset_needed = false
    }
    if (this.features.complexity) {
      defaults.complexity = 'simple'
    }

    return defaults
  }
} 