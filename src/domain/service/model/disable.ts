import { getPlatformDisabledKey, IModel, ModelPlatform } from '@/domain/entity/model'
import { Adapter } from '../../types'

export type Disable = (id: string, platform: ModelPlatform) => Promise<IModel | never>

export const buildDisable = ({ modelRepository }: Adapter): Disable => {
  return async (id, platform) => {
    const key = getPlatformDisabledKey(platform)
    const model = await modelRepository.update({
      where: {
        id
      },
      data: {
        [key]: true
      }
    })

    if (model && model.parent_id) {
      const parentModel = await modelRepository.get({
        where: {
          id: model.parent_id
        },
        include: {
          children: {
            where: {
              [key]: false
            }
          }
        }
      })

      if (parentModel && parentModel.children && parentModel.children.length === 0) {
        await modelRepository.update({
          where: {
            id: model.parent_id
          },
          data: {
            [key]: true
          }
        })
      }
    }

    return model
  }
}
