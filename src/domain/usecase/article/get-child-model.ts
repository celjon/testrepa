import { IModel } from '@/domain/entity/model'
import { UseCaseParams } from '../types'
import { ForbiddenError, NotFoundError } from '@/domain/errors'
import { ISubscription } from '@/domain/entity/subscription'
import { IEmployee } from '@/domain/entity/employee'
import { IPlan } from '@/domain/entity/plan'
import { IUser } from '@/domain/entity/user'
import { Role } from '@prisma/client'

export type GetChildModel = (params: { model_id: string; userId: string }) => Promise<{
  model: IModel
  subscription: ISubscription | null
  employee: IEmployee | null
  plan: IPlan
  user: IUser
}>

export const buildGetChildModel = ({ service, adapter }: UseCaseParams): GetChildModel => {
  return async ({ model_id, userId }) => {
    const user = await adapter.userRepository.get({
      where: { id: userId }
    })

    if (!user) {
      throw new NotFoundError({
        code: 'USER_NOT_FOUND'
      })
    }
    const isAdmin = user.role === Role.ADMIN
    const subscription = await service.user.getActualSubscriptionById(userId)
    if (!isAdmin && (!subscription || subscription.balance <= 0 || !subscription.plan)) {
      throw new ForbiddenError({
        code: 'NOT_ENOUGH_TOKENS',
        message: 'Not enough tokens'
      })
    }
    const employee = await adapter.employeeRepository.get({
      where: { user_id: userId },
      include: { allowed_models: true, enterprise: true }
    })
    const employeeId = employee?.allowed_models?.length != 0 ? employee?.id : undefined

    let plan: IPlan | null = await adapter.planRepository.get({ where: { type: 'ELITE' } })
    if (isAdmin) {
      let elitePlan = await adapter.planRepository.get({
        where: { type: 'ELITE' },
        include: {
          models: {
            where: { deleted_at: null },
            include: {
              model: true
            }
          }
        }
      })
      plan = elitePlan
    } else if (subscription?.plan) {
      plan = await adapter.planRepository.get({
        where: { id: subscription.plan.id },
        include: {
          models: {
            where: { deleted_at: null },
            include: {
              model: true
            }
          }
        }
      })
    }
    if (!plan) {
      throw new ForbiddenError({
        code: 'NOT_ENOUGH_TOKENS',
        message: 'Not enough tokens'
      })
    }
    const model = await adapter.modelRepository.get({
      where: { id: model_id }
    })

    if (!model) {
      throw new ForbiddenError({
        code: 'NO_DEFAULT_MODEL',
        message: 'No default model found for current plan'
      })
    }
    let access = false
    if (subscription?.plan) {
      const { hasAccess } = await service.plan.hasAccess(subscription.plan, model.id, employeeId)
      access = hasAccess
    }
    if (!access && !isAdmin) {
      throw new ForbiddenError({
        code: 'MODEL_NOT_ALLOWED_FOR_PLAN',
        message: 'Has no access to this model'
      })
    }

    return { model, subscription, employee, plan, user }
  }
}
