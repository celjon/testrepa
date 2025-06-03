import { IPlan, PlanType } from '@/domain/entity/plan'
import { IUser } from '@/domain/entity/user'
import { IReferral } from '@/domain/entity/referral'
import { Adapter } from '../../types'
import { ChatService } from '../chat'
import { Region } from '@prisma/client'

type Params = Adapter & {
  chatService: ChatService
}

export type Initialize = (
  params: {
    email?: string
    emailVerified?: boolean
    password?: string
    yandexMetricClientId: string | null
    yandexMetricYclid: string | null
    receiveEmails?: boolean
    hadSubscriptedForEmails?: boolean
    avatar?: string
    tg_id?: string
    name?: string
    anonymousDeviceFingerprint?: string
    inactive?: boolean
    region?: Region
  },
  invitedBy?: string | null,
  anonymousUser?: IUser | null,
  linkedBefore?: boolean | null
) => Promise<IUser | null | never>

export const buildInitialize = ({
  userRepository,
  referralRepository,
  planRepository,
  chatRepository,
  articleRepository,
  oldEmailRepository
}: Params): Initialize => {
  return async (data, invitedBy = null, anonymousUser = null, linkedBefore = false) => {
    let plan: IPlan
    let tokens: bigint
    let referral: IReferral | null = null

    if (invitedBy) {
      referral = await referralRepository.get({
        where: {
          code: invitedBy,
          disabled: false
        },
        include: {
          template: {
            include: {
              plan: true
            }
          }
        }
      })

      if (!referral || !referral.template) {
        plan = (await planRepository.get({
          where: {
            type: PlanType.FREE
          }
        })) as IPlan

        tokens = BigInt(anonymousUser?.subscription!.balance ?? Math.trunc(plan.tokens))
      } else {
        plan = referral.template.plan
        tokens = BigInt(Math.trunc(referral.template.tokens || referral.template.plan.tokens))
      }
    } else {
      plan = (await planRepository.get({
        where: {
          type: PlanType.FREE
        },
        include: {
          models: true
        }
      })) as IPlan
      tokens = BigInt(anonymousUser?.subscription!.balance ?? Math.trunc(plan.tokens))
    }

    const oldEmail = await oldEmailRepository.get({
      where: {
        email: data.email?.toLowerCase()
      }
    })

    const user = await userRepository.create({
      data: {
        ...data,
        email: data.email ? data.email.toLowerCase() : undefined,
        emailVerified: data.emailVerified === undefined ? false : data.emailVerified,
        subscription: {
          create: {
            plan_id: plan.id,
            balance: linkedBefore || oldEmail ? 0 : tokens
          }
        },
        ...(referral && {
          referral_participants: {
            create: {
              referral_id: referral.id
            }
          }
        })
      },
      include: {
        subscription: {
          include: {
            plan: true
          }
        },
        employees: {
          include: {
            enterprise: {
              include: {
                subscription: {
                  include: {
                    plan: true
                  }
                }
              }
            }
          }
        }
      }
    })

    if (anonymousUser) {
      // add anonymous user's chats to the new user
      await chatRepository.updateMany({
        where: { user_id: anonymousUser.id },
        data: { user_id: user.id }
      })
      await articleRepository.updateMany({
        where: { user_id: anonymousUser.id },
        data: { user_id: user.id }
      })
    }

    return user
  }
}
