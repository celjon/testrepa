import { UseCaseParams } from '@/domain/usecase/types'
import { IReferralWithStats } from '@/domain/entity/referral'

export type List = (data: { userId: string }) => Promise<Array<IReferralWithStats> | never>

export const buildList = ({ adapter }: UseCaseParams): List => {
  return async ({ userId }) => {
    return adapter.referralRepository.listWithStats({ userId })
  }
}
