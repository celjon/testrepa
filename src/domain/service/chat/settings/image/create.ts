import { IModel } from '@/domain/entity/model'
import { Prisma } from '@prisma/client'

export type Create = (params: {
  defaultModel: Pick<IModel, 'id'>
}) => Prisma.ChatImageSettingsCreateInput

export const buildCreate =
  (): Create =>
  ({ defaultModel }) => {
    const model = defaultModel.id

    return {
      model,
      size: '1024x1024',
      quality: model === 'gpt-image-1' ? 'low' : 'standard',
      style: 'default',
    }
  }
