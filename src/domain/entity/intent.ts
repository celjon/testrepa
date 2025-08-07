export enum IntentType {
  TEXT = 'TEXT',
  IMAGE = 'IMAGE',
  // VIDEO = 'VIDEO',
  // AUDIO = 'AUDIO',
  WEB_SEARCH = 'WEB_SEARCH',
}

export interface IIntent {
  type: IntentType
  confidence: number
  reasoning: string
  tokensUsed: number
}
