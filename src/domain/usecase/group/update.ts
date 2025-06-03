import { IGroup } from '@/domain/entity/group'
import { UseCaseParams } from '../types'
import { ForbiddenError } from '@/domain/errors'

export type Update = (data: {
  userId: string
  id: string
  name?: string
  highlight?: string
  order?: number
}) => Promise<IGroup | null | never>

export const buildUpdate = ({ adapter }: UseCaseParams): Update => {
  return async ({ userId, name, highlight, id, order }) => {
    let group = await adapter.groupRepository.get({
      where: {
        id,
        user_id: userId
      }
    })

    if (!group) {
      throw new ForbiddenError()
    }

    group = await adapter.groupRepository.update({
      where: {
        id
      },
      data: {
        name,
        highlight,
        order
      }
    })

    return group
  }
}
