import * as bcrypt from 'bcrypt'
import { Platform } from '@prisma/client'
import { IUser } from '@/domain/entity/user'
import { UseCaseParams } from '../types'
import { ForbiddenError, InternalError } from '@/domain/errors'
import { actions } from '@/domain/entity/action'

export type Register = (params: {
  email: string
  password: string
  receiveEmails: boolean
  invitedBy?: string
  fingerprint?: string
  ip: string
  yandexMetricClientId: string | null
  yandexMetricYclid: string | null
  metadata?: {
    locale?: string
  }
  autoVerified?: boolean
}) => Promise<
  | {
      user: IUser
    }
  | never
>

export const buildRegister = ({ adapter, service }: UseCaseParams): Register => {
  const { mailGateway } = adapter

  return async ({
    email,
    password,
    receiveEmails,
    invitedBy,
    fingerprint,
    metadata,
    autoVerified = false,
    ip,
    yandexMetricClientId,
    yandexMetricYclid,
  }) => {
    const existingUser = await adapter.userRepository.get({
      where: {
        email: {
          equals: email,
          mode: 'insensitive',
        },
      },
    })

    const hasVerifiedEmail = existingUser?.email && existingUser.emailVerified
    if ((existingUser !== null && !existingUser.inactive) || hasVerifiedEmail) {
      throw new ForbiddenError({
        code: 'CREDENTIALS_TAKEN',
      })
    }

    const hash = await bcrypt.hash(password as string, 10)

    let anonymousUser: IUser | null

    if (fingerprint) {
      anonymousUser = await adapter.userRepository.get({
        where: {
          anonymousDeviceFingerprint: fingerprint,
        },
        include: {
          subscription: true,
        },
      })
    } else {
      anonymousUser = null
    }

    const region = await service.geo.determinePaymentRegion({ ip })

    const createdUser =
      existingUser ??
      (await service.user.initialize(
        {
          email: email,
          password: hash,
          receiveEmails,
          hadSubscriptedForEmails: receiveEmails,
          yandexMetricClientId,
          yandexMetricYclid,
          emailVerified: autoVerified,
          inactive: autoVerified ? false : true,
          region,
        },
        invitedBy,
        anonymousUser,
      ))

    if (!createdUser) {
      throw new InternalError()
    }

    await Promise.all([
      mailGateway.sendWelcomeMail({
        to: email,
        user: {
          email: email,
          password: password,
        },
        locale: metadata?.locale,
      }),

      service.auth.sendVerificationCode({
        userId: createdUser.id,
        email: email,
        locale: metadata?.locale,
      }),

      adapter.actionRepository.create({
        data: {
          type: actions.REGISTRATION,
          user_id: createdUser.id,
          platform: Platform.WEB,
        },
      }),
    ])

    if (existingUser) {
      await adapter.userRepository.update({
        where: { id: existingUser.id },
        data: {
          inactive: true,
          emailVerified: false,
          password: hash,
          receiveEmails,
          hadSubscriptedForEmails: receiveEmails,
          region,
        },
      })
    }

    return {
      user: createdUser,
    }
  }
}
