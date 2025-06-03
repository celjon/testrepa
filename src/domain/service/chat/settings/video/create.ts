import { IModel } from '@/domain/entity/model'
import { Prisma } from '@prisma/client'

export type Create = (params: { defaultModel: IModel }) => Prisma.ChatVideoSettingsCreateInput

export const buildCreate =
  (): Create =>
  ({ defaultModel }) => {
    const model = defaultModel.id

    return { model }
  }
