import { tokenize } from '@/lib/tokenizer'
import { IModel } from '@/domain/entity/model'
import { IChatTextSettings } from '@/domain/entity/chat-settings'
import { IMessage } from '@/domain/entity/message'
import { GetCapsText } from '@/domain/service/model/get-caps/get-caps-text'

type Params = { getCapsText: GetCapsText }

export type EstimateText = (data: {
  model: IModel
  textSettings: IChatTextSettings
  spentCaps: number
  messages: IMessage[]
  prompt: string
}) => Promise<number>
export const buildEstimateText = ({ getCapsText }: Params): EstimateText => {
  return async (data) => {
    const { model, textSettings, spentCaps, messages, prompt } = data

    const inputTokens = tokenize(
      `${prompt}+${messages.map((message) => message.content).join('\n')}`,
      model.id,
    )

    const estimate =
      (await getCapsText({
        model,
        usage: {
          prompt_tokens: inputTokens,
          completion_tokens: Math.floor(
            Math.min(
              textSettings.max_tokens ?? model.max_tokens,
              Math.max(model.context_length - inputTokens, 0),
            ) / 2,
          ),
        },
      })) + spentCaps
    return estimate
  }
}
