import { UseCaseParams } from '@/domain/usecase/types'
import { IReferral } from '@/domain/entity/referral'
import { NotFoundError } from '@/domain/errors'

export type Delete = (data: { userId?: string; id: string }) => Promise<IReferral | never>

export const buildDelete = ({ adapter }: UseCaseParams): Delete => {
  return async ({ userId, id }) => {
    const referral = await adapter.referralRepository.get({
      where: {
        owner_id: userId,
        id
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

    if (!referral) {
      throw new NotFoundError()
    }

    const updatedReferral = await adapter.referralRepository.update({
      where: {
        id
      },
      data: {
        disabled: true
      }
    })

    return updatedReferral!
  }
}
