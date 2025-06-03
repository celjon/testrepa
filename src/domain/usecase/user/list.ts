import { UseCaseParams } from '@/domain/usecase/types'
import { IUser } from '@/domain/entity/user'

export type List = (data: { search?: string; page?: number; userId?: string }) => Promise<
  | {
      data: Array<IUser>
      pages: number
    }
  | never
>

export const buildList = ({ service }: UseCaseParams): List => {
  return async ({ page, search }) => {
    const users = await service.user.paginate({
      query: {
        where: {
          OR: [
            {
              name: {
                contains: search,
                mode: 'insensitive'
              }
            },
            {
              email: {
                contains: search,
                mode: 'insensitive'
              }
            },
            {
              tg_id: {
                contains: search
              }
            }
          ]
        },
        include: {
          subscription: {
            include: {
              plan: true
            }
          }
        }
      },
      page
    })

    return users
  }
}
