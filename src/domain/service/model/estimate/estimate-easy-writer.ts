import { tokenize } from '@/lib/tokenizer'
import { IModel } from '@/domain/entity/model'
import { GetCapsText } from '@/domain/service/model/get-caps/get-caps-text'

type Params = { getCapsText: GetCapsText }

type EstimateEasyWriterParams = {
  model: IModel
  prompt: string
  constantCost: number
  symbolsCount: number
}
export type EstimateEasyWriter = (data: EstimateEasyWriterParams) => Promise<number>
export const buildEstimateEasyWriter = ({ getCapsText }: Params): EstimateEasyWriter => {
  return async (data: EstimateEasyWriterParams) => {
    const { model, prompt, constantCost, symbolsCount } = data

    const outputPricing = symbolsCount * 2 * model.pricing!.output!
    const estimate =
      (await getCapsText({
        model: model,
        usage: {
          prompt_tokens: tokenize(prompt, model.id),
          completion_tokens: 0,
        },
      })) +
      constantCost +
      outputPricing

    return estimate
  }
}
