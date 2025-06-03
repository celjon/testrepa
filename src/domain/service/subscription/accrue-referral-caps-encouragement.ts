import { Currency, PlanType, TransactionProvider, TransactionStatus, TransactionType } from '@prisma/client'
import { Adapter } from '@/domain/types'
import { ISubscription } from '@/domain/entity/subscription'
import { InvalidDataError } from '@/domain/errors'

type Params = Pick<Adapter, 'referralRepository' | 'subscriptionRepository' | 'transactionRepository'>

export type AccrueReferralCapsEncouragement = (
  params: {
    participantSubscription: ISubscription
    spent_caps: number
  },
  tx?: unknown
) => Promise<void>

export const buildAccrueReferralCapsEncouragement = ({
  referralRepository,
  subscriptionRepository,
  transactionRepository
}: Params): AccrueReferralCapsEncouragement => {
  return async ({ participantSubscription, spent_caps }, tx) => {
    if (spent_caps < 0) {
      throw new InvalidDataError({
        code: 'NEGATIVE_AMOUNT'
      })
    }
    if (spent_caps === 0) {
      return
    }

    if (!participantSubscription.user_id || !participantSubscription.plan) {
      return
    }
    if (participantSubscription.plan.type === PlanType.FREE) {
      return
    }

    const referral = await referralRepository.get(
      {
        where: {
          participants: {
            some: { user_id: participantSubscription.user_id }
          }
        },
        include: {
          owner: {
            include: {
              subscription: { include: { plan: true } },
              employees: {
                take: 1,
                include: {
                  enterprise: {
                    include: {
                      subscription: { include: { plan: true } }
                    }
                  }
                }
              }
            }
          },
          template: true
        }
      },
      tx
    )

    if (!referral || !referral.owner || !referral.owner.subscription || !referral.owner.subscription.plan || !referral.template) {
      return
    }

    const employee = referral.owner?.employees && referral.owner.employees.length > 0 ? referral.owner.employees[0] : null

    const memberOfCommonPoolEnterprise = !!employee?.enterprise?.common_pool
    const enterpriseSubscription = employee?.enterprise?.subscription

    const referralOwnerSubscription =
      memberOfCommonPoolEnterprise && enterpriseSubscription ? enterpriseSubscription : referral.owner.subscription

    const encouragement = Math.trunc((spent_caps * referral.template.caps_encouragement_percentage) / 100)

    if (BigInt(encouragement) === 0n) {
      return
    }

    await Promise.all([
      subscriptionRepository.update(
        {
          where: {
            id: referralOwnerSubscription.id
          },
          data: {
            balance: {
              increment: encouragement
            }
          }
        },
        tx
      ),
      transactionRepository.create(
        {
          data: {
            user_id: referralOwnerSubscription.user_id,
            amount: encouragement,
            type: TransactionType.REFERRAL_REWARD,
            currency: Currency.BOTHUB_TOKEN,
            status: TransactionStatus.SUCCEDED,
            provider: TransactionProvider.BOTHUB,
            from_user_id: participantSubscription.user_id,
            referral_id: referral.id
          }
        },
        tx
      )
    ])
  }
}
