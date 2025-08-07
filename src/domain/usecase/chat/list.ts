import { UseCaseParams } from '@/domain/usecase/types'
import { IChat } from '@/domain/entity/chat'
import { Platform } from '@prisma/client'
import { ForbiddenError } from '@/domain/errors'
import { logger } from '@/lib/logger'

export type List = (data: {
  userId: string | null
  groupId?: string
  groupIds?: string[]
  page?: number
  search?: string
  sort?: string
  sortDirection?: string
  quantity?: number
}) => Promise<
  | {
      data: Array<IChat>
      pages: number
    }
  | never
>

export const buildList = ({ service }: UseCaseParams): List => {
  return async ({
    userId,
    groupId,
    groupIds,
    search,
    sort,
    page,
    sortDirection = 'desc',
    quantity = 10,
  }) => {
    let platform: { not: Platform } | undefined = {
      not: Platform.TELEGRAM,
    }
    if (groupId === 'telegram') platform = undefined

    const group_id = groupId ?? (search ? undefined : null)

    try {
      const chats = await service.chat.paginate({
        query: {
          where: {
            group_id: group_id !== null ? group_id : groupIds ? { in: groupIds } : null,
            user_id: userId,
            name: {
              contains: search,
              mode: 'insensitive',
            },
            deleted: false,
            platform,
          },
          include: {
            model: {
              include: { icon: true },
            },
          },
          orderBy: sort ? { [sort]: sortDirection } : undefined,
        },
        page,
        quantity,
      })

      return chats
    } catch (error) {
      logger.error(`An error occurred while fetching chats: ${String(error)}`)
      throw new ForbiddenError({ code: 'BAD_SORT_PARAMS' })
    }
  }
}
