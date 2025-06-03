import { getPlatformDisabledKey, IModel, ModelPlatform } from '@/domain/entity/model'
import { Adapter } from '../../types'

export type Enable = (id: string, platform: ModelPlatform) => Promise<IModel | never>

export const buildEnable = ({ modelRepository }: Adapter): Enable => {
  return async (id, platform) => {
    const key = getPlatformDisabledKey(platform)
    const model = await modelRepository.update({
      where: {
        id
      },
      data: {
        [key]: false
      }
    })

    if (model && model.parent_id) {
      await modelRepository.update({
        where: {
          id: model.parent_id
        },
        data: {
          [key]: false
        }
      })
    }

    return model
  }
}
