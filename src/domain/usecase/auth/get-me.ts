import { UseCaseParams } from '@/domain/usecase/types'
import { IUser } from '@/domain/entity/user'
import { UnauthorizedError } from '@/domain/errors'

export type GetMe = (data: { id: string }) => Promise<IUser | never>
export const buildGetMe = ({ adapter }: UseCaseParams): GetMe => {
  return async ({ id }) => {
    const user = await adapter.userRepository.get({
      where: {
        id,
      },
      include: {
        groups: true,
        subscription: {
          include: {
            plan: true,
          },
        },
        employees: {
          include: {
            enterprise: {
              include: {
                subscription: {
                  include: {
                    plan: true,
                  },
                },
              },
            },
          },
        },
      },
    })

    if (!user) {
      throw new UnauthorizedError({
        code: 'UNAUTHORIZED',
      })
    }

    return user
  }
}
