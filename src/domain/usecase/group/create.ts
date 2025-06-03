import { UseCaseParams } from '@/domain/usecase/types'
import { IGroup } from '@/domain/entity/group'
import { NotFoundError } from '@/domain/errors'

export type Create = (data: {
  userId: string
  name: string
  presetId?: string
  highlight?: string
  order?: number
}) => Promise<IGroup | undefined | never>

export const buildCreate = ({ adapter }: UseCaseParams): Create => {
  return async ({ userId, name, presetId, highlight, order }) => {
    let preset = null

    if (presetId) {
      preset = await adapter.presetRepository.get({
        where: {
          id: presetId
        }
      })

      if (!preset) {
        throw new NotFoundError({
          code: 'PRESET_NOT_FOUND'
        })
      }
    }

    const group = await adapter.groupRepository.create({
      data: {
        user_id: userId,
        ...(preset && { preset_id: preset.id }),
        name,
        highlight,
        order
      }
    })

    await adapter.groupRepository.updateMany({
      where: {
        user_id: userId,
        id: {
          not: group.id
        }
      },
      data: {
        order: {
          increment: 1
        }
      }
    })

    return group
  }
}
