import { InternalError, InvalidDataError, NotFoundError } from '@/domain/errors'
import { UseCaseParams } from '../types'
import { ISubscription } from '@/domain/entity/subscription'

export type ToggleReceiveEmails = (data: { userId: string; receiveEmails: boolean }) => Promise<{
  subscription: ISubscription
}>

export const buildToggleReceiveEmails = ({ adapter, service }: UseCaseParams): ToggleReceiveEmails => {
  return async ({ userId, receiveEmails }) => {
    let user = await adapter.userRepository.get({
      where: { id: userId },
      include: {
        subscription: true
      }
    })

    if (!user || !user.subscription) {
      throw new NotFoundError({ code: 'USER_NOT_FOUND' })
    }
    if (!user.email) {
      throw new InvalidDataError({ code: 'USER_HAS_NO_EMAIL' })
    }

    // First time user subscribes for emails
    if (receiveEmails && !user.hadSubscriptedForEmails) {
      await service.subscription.replenish({
        subscription: user.subscription,
        amount: 10_000
      })
    }

    user = await adapter.userRepository.update({
      where: { id: userId },
      data: {
        receiveEmails,
        hadSubscriptedForEmails: receiveEmails || user.hadSubscriptedForEmails
      },
      include: {
        subscription: true
      }
    })
    if (!user || !user.subscription) {
      throw new InternalError()
    }

    return { subscription: user.subscription! }
  }
}
