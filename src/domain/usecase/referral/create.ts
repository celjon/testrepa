import { UseCaseParams } from '@/domain/usecase/types'
import { IReferral } from '@/domain/entity/referral'
import { nanoid } from 'nanoid'
import { ForbiddenError, NotFoundError } from '@/domain/errors'

export type Create = (data: {
  userId: string
  templateId: string
  name?: string
}) => Promise<IReferral | never>

export const buildCreate = ({ adapter }: UseCaseParams): Create => {
  return async ({ userId, templateId, name }) => {
    const template = await adapter.referralTemplateRepository.get({
      where: {
        id: templateId,
      },
    })

    if (!template) {
      throw new NotFoundError({
        code: 'TEMPLATE_NOT_FOUND',
      })
    }

    const user = await adapter.userRepository.get({
      where: {
        id: userId,
      },
    })

    if (template.private === true && user?.role !== 'ADMIN') {
      throw new ForbiddenError({
        code: 'TEMPLATE_IS_PRIVATE',
      })
    }

    const referral = await adapter.referralRepository.create({
      data: {
        owner_id: userId,
        template_id: templateId,
        code: nanoid(),
        name,
      },
      include: {
        participants: {
          include: {
            user: true,
          },
        },
        template: {
          include: {
            plan: true,
          },
        },
      },
    })

    return referral
  }
}
