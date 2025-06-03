import { logger } from '@/lib/logger'
import { getErrorString } from '@/lib'
import { IUser } from '@/domain/entity/user'
import { Adapter } from '../../types'

export type MergeAccounts = (params: {
  from: IUser
  to: IUser
  onMergeComplete?: (user: IUser) => Promise<void | never>
}) => Promise<IUser | null | never>

export const buildMergeAccounts = ({
  transactionRepository,
  shortcutRepository,
  presetRepository,
  groupRepository,
  messageRepository,
  chatRepository,
  articleRepository,
  actionRepository,
  subscriptionRepository,
  userRepository,
  referralRepository,
  referralParticipantRepository,
  transactor
}: Adapter): MergeAccounts => {
  return async ({ from, to, onMergeComplete }) => {
    const newSubscriptionData = {
      plan_id: from.subscription!.plan!.tokens > to.subscription!.plan!.tokens ? from.subscription!.plan_id : to.subscription!.plan_id,
      balance: {
        increment: from.subscription!.balance
      }
    }

    const isReferralParticipant = to.referral_participants.length > 0

    const user = await transactor.inTx(
      async (tx) => {
        try {
          const jobs = [
            transactionRepository.updateMany(
              {
                where: { user_id: from.id },
                data: { user_id: to.id }
              },
              tx
            ),
            shortcutRepository.updateMany(
              {
                where: { user_id: from.id },
                data: { user_id: to.id }
              },
              tx
            ),
            presetRepository.updateMany(
              {
                where: { author_id: from.id },
                data: { author_id: to.id }
              },
              tx
            ),
            groupRepository.updateMany(
              {
                where: { user_id: from.id },
                data: { user_id: to.id }
              },
              tx
            ),
            messageRepository.updateMany(
              {
                where: { user_id: from.id },
                data: { user_id: to.id }
              },
              tx
            ),
            chatRepository.updateMany(
              {
                where: { user_id: from.id },
                data: { user_id: to.id }
              },
              tx
            ),
            articleRepository.updateMany(
              {
                where: { user_id: from.id },
                data: { user_id: to.id }
              },
              tx
            ),
            actionRepository.updateMany(
              {
                where: { user_id: from.id },
                data: { user_id: to.id }
              },
              tx
            ),
            referralRepository.updateMany(
              {
                where: { owner_id: from.id },
                data: { owner_id: to.id }
              },
              tx
            ),
            isReferralParticipant
              ? referralParticipantRepository.deleteMany({ where: { user_id: from.id } }, tx)
              : referralParticipantRepository.updateMany(
                  {
                    where: { user_id: from.id },
                    data: { user_id: to.id }
                  },
                  tx
                ),
            subscriptionRepository.update(
              {
                where: { id: to.subscription!.id },
                data: newSubscriptionData
              },
              tx
            )
          ]

          await Promise.all(jobs)

          // delete user after everything is moved to "to" user
          await userRepository.delete({ where: { id: from.id } }, tx)

          const user = await userRepository.update(
            {
              where: { id: to.id },
              data: {
                tg_id: from.tg_id,
                avatar: from.avatar
              },
              include: { subscription: { include: { plan: true } } }
            },
            tx
          )

          if (onMergeComplete) {
            await onMergeComplete(user)
          }

          return user
        } catch (e) {
          logger.error({
            location: 'service.user.mergeAccounts',
            message: getErrorString(e),
            fromUserId: from.id,
            toUserId: to.id
          })

          throw e
        }
      },
      {
        timeout: 300000
      }
    )

    return user
  }
}
