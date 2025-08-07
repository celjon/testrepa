import { IModel } from '@/domain/entity/model'
import { Prisma } from '@prisma/client'

export type Update = (params: { defaultModel: IModel }) => Prisma.ChatTextSettingsCreateInput

export const buildUpdate =
  (): Update =>
  ({ defaultModel }) => {
    const model = defaultModel.id
    const maxTokens = defaultModel.max_tokens

    return {
      model,
      max_tokens: maxTokens,
    }
  }
