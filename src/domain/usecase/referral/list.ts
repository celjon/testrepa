import { UseCaseParams } from '@/domain/usecase/types'
import { IReferral, IReferralWithStats } from '@/domain/entity/referral'
import { ITransaction } from '@/domain/entity/transaction'

export type List = (data: { userId: string }) => Promise<Array<IReferralWithStats> | never>

export const buildList = ({ adapter }: UseCaseParams): List => {
  return async ({ userId }) => {
    const referrals: Array<IReferral> = await adapter.referralRepository.list({
      where: {
        owner_id: userId,
        disabled: false
      },
      include: {
        participants: {
          include: {
            user: true
          }
        },
        template: {
          include: {
            plan: true
          }
        }
      }
    })

    const referralsWithStats: Array<IReferralWithStats> = []

    for (const referral of referrals) {
      const transactions = await adapter.transactionRepository.groupBy({
        by: ['currency'],
        where: {
          currency: { not: 'BOTHUB_TOKEN' },
          deleted: false,
          user: {
            id: {
              in: referral.participants?.map((participant) => participant.user_id)
            }
          },
          status: 'SUCCEDED'
        },
        _sum: {
          amount: true
        },
        orderBy: {}
      })

      const amount_spend_by_users = transactions.reduce((sum, transaction) => {
        const amount = transaction._sum?.amount || 0

        if (transaction.currency === 'RUB') {
          return sum + amount
        } else {
          return sum + amount * 100
        }
      }, 0)

      const referralWithStats = {
        ...referral,
        amount_spend_by_users,
        participants_count: referral.participants?.length || 0,
        paid_participants_count: countUniqueUserIds(transactions)
      }
      delete referralWithStats.participants

      referralsWithStats.push(referralWithStats)
    }

    return referralsWithStats
  }
}

function countUniqueUserIds(array: ITransaction[]) {
  const seen: { [key: string]: boolean } = {}
  let count = 0

  for (let i = 0; i < array.length; i++) {
    const item = array[i]
    if (!item.user_id) continue

    if (!seen[item.user_id]) {
      seen[item.user_id] = true
      count++
    }
  }

  return count
}
