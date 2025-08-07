import { tokenize } from '@/lib/tokenizer'
import { IModel } from '@/domain/entity/model'
import { PromptItem } from '@/domain/entity/prompt-item'
import { ChatCompletionMessageParam } from 'openai/resources'
import { GetCapsText } from '@/domain/service/model/get-caps/get-caps-text'

type Params = { getCapsText: GetCapsText }

type EstimatePromptQueueParams = {
  constantCost: number
  prompt: PromptItem
  messages: ChatCompletionMessageParam[]
  model: IModel
}
export type EstimatePromptQueue = (data: EstimatePromptQueueParams) => Promise<number>
export const buildEstimatePromptQueue = ({ getCapsText }: Params): EstimatePromptQueue => {
  return async (data: EstimatePromptQueueParams) => {
    const { constantCost, prompt, messages, model } = data

    const promptWithContext = `${prompt.message}+${messages.map((message) => message.content).join('\n')}`
    const inputTokens = prompt.include_context
      ? tokenize(promptWithContext, model.id)
      : tokenize(prompt.message, model.id)
    const estimate =
      (await getCapsText({
        model,
        usage: {
          prompt_tokens: inputTokens,
          completion_tokens: Math.floor(Math.max(model.context_length - inputTokens, 0) / 2),
        },
      })) + constantCost

    return estimate
  }
}
