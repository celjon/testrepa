import { encode } from 'gpt-tokenizer'
import { countTokens } from '@anthropic-ai/tokenizer'
import { encoding_for_model, TiktokenModel } from 'tiktoken'
import { isClaude } from '@/domain/entity/model'

export const tokenize = (message: string, model: string): number => {
  if (isClaude(model)) {
    return countTokens(message)
  }

  try {
    const encoding = encoding_for_model(model as TiktokenModel) // can throw
    try {
      return encoding.encode(message).length
    } finally {
      encoding.free()
    }
  } catch {
    return gptTokenize(message)
  }
}

const gptTokenize = (message: string): number => {
  try {
    return encode(message).length
  } catch {
    return 0
  }
}
