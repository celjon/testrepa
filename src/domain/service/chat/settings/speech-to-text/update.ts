import { IModel } from '@/domain/entity/model'
import { Prisma } from '@prisma/client'

export type Update = (params: { defaultModel: IModel }) => Prisma.ChatSpeechSettingsCreateInput

export const buildUpdate =
  (): Update =>
  ({ defaultModel }) => {
    const model = defaultModel.id

    return { model }
  }
