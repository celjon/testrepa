import { verifyJWT } from '@/lib'
import { JwtPayload } from 'jsonwebtoken'
import { EnterpriseRole } from '@prisma/client'
import { UseCaseParams } from '@/domain/usecase/types'
import { IUser } from '@/domain/entity/user'
import { ForbiddenError } from '@/domain/errors'

export type Join = (data: { inviteToken: string; userId: string }) => Promise<IUser | never>
export const buildJoin = ({ adapter }: UseCaseParams): Join => {
  return async ({ inviteToken, userId }) => {
    //Если пользователь уже состоит в какой-то компании, то не даём присоединиться
    const existingEmployee = await adapter.employeeRepository.get({
      where: {
        user_id: userId,
      },
    })
    if (existingEmployee) {
      throw new ForbiddenError({
        code: 'EMPLOYEE_ALREADY_JOINED',
      })
    }

    const tokenPayload = verifyJWT(inviteToken) as JwtPayload & {
      enterpriseId: string
    }
    if (!tokenPayload.enterpriseId) {
      throw new ForbiddenError({
        code: 'INVALID_INVITE_TOKEN',
      })
    }

    const employee = await adapter.employeeRepository.create({
      data: {
        enterprise_id: tokenPayload.enterpriseId,
        user_id: userId,
        role: EnterpriseRole.EMPLOYEE,
      },
      include: {
        enterprise: { include: { subscription: true } },
      },
    })

    return (await adapter.userRepository.update({
      where: {
        id: userId,
      },
      data: {
        subscription: {
          update: {
            plan_id: employee!.enterprise!.subscription!.plan_id,
          },
        },
      },
      include: {
        employees: {
          include: {
            enterprise: {
              include: {
                subscription: true,
              },
            },
          },
        },
        subscription: true,
      },
    })) as IUser
  }
}
