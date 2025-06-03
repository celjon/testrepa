import { UseCaseParams } from '@/domain/usecase/types'
import { Currency, EnterpriseRole, EnterpriseType, TransactionProvider, TransactionStatus, TransactionType } from '@prisma/client'
import { logger } from '@/lib/logger'
import { isAxiosError } from 'axios'
import { config } from '@/config'
import { IPaymentRequest } from '@/domain/entity/payment'
import { CreatePaymentError } from '@/lib/clients/yoomoney/types'
import { WithRequired } from '@/lib/utils/types'
import { BaseError, ForbiddenError, InternalError, NotFoundError } from '@/domain/errors'

export type Buy = (data: {
  userId: string
  planId: string
  provider?: TransactionProvider
  presentEmail?: string
  presentUserId?: string
  yandexMetricClientId: string | null
  yandexMetricYclid: string | null
}) => Promise<{ url: string } | never>
export const buildBuy = ({ adapter, service }: UseCaseParams): Buy => {
  return async ({ userId, planId, provider, presentEmail, presentUserId, yandexMetricClientId, yandexMetricYclid }) => {
    const initiator = await adapter.userRepository.get({
      where: { id: userId },
      include: { employees: true }
    })
    const present = !!presentEmail || !!presentUserId
    let user = present
      ? await adapter.userRepository.get({
          where: presentEmail
            ? {
                email: {
                  equals: presentEmail,
                  mode: 'insensitive'
                }
              }
            : {
                id: presentUserId
              },
          include: {
            employees: true
          }
        })
      : initiator

    if (!user) {
      if (presentEmail) {
        user = await service.user.initialize({
          email: presentEmail.toLowerCase(),
          emailVerified: false,
          inactive: true,
          yandexMetricClientId,
          yandexMetricYclid
        })
      } else {
        throw new NotFoundError({
          code: 'USER_NOT_FOUND'
        })
      }
    }

    if (user?.employees && user.employees.length > 0) {
      const ownerEmployee = user.employees.find((e) => e.role === EnterpriseRole.OWNER)

      if (!ownerEmployee) {
        throw new ForbiddenError({
          code: 'USER_IS_ORGANIZATION_MEMBER'
        })
      }

      const enterprise = await adapter.enterpriseRepository.get({
        where: {
          id: ownerEmployee.enterprise_id
        }
      })
      if (enterprise?.type === EnterpriseType.CONTRACTED) {
        throw new ForbiddenError({
          code: 'USER_IS_ORGANIZATION_MEMBER'
        })
      }
    }

    const plan = await adapter.planRepository.get({
      where: {
        id: planId
      }
    })

    if (!plan) {
      throw new NotFoundError({
        code: 'PLAN_NOT_FOUND'
      })
    }

    if (!plan.price) {
      throw new ForbiddenError({
        code: 'PLAN_IS_FREE'
      })
    }

    let currentProvider: TransactionProvider

    if (provider) {
      if (plan.currency === 'RUB') {
        if (provider === TransactionProvider.YOOMONEY) {
          currentProvider = 'YOOMONEY'
        } else if (provider === TransactionProvider.TINKOFF) {
          currentProvider = 'TINKOFF'
        } else {
          throw new ForbiddenError({
            code: 'PROVIDER_IS_NOT_SUPPORTED'
          })
        }
      } else {
        currentProvider = provider
      }
    } else {
      currentProvider = plan.currency === Currency.RUB ? TransactionProvider.YOOMONEY : TransactionProvider.CRYPTO
    }

    const data: IPaymentRequest = {
      price: plan.price,
      currency: plan.currency,
      description: plan.type + ' plan purchase',
      customer: {
        email: user && user.email ? user.email : config.default_customer_email
      },
      item: {
        name: `Bothub ${plan.type}`
      },
      returnUrl: config.frontend.address
    }
    let payment

    if (currentProvider === TransactionProvider.YOOMONEY) {
      try {
        payment = await service.payment.yoomoney.createPayment(data as WithRequired<IPaymentRequest, 'item'>)
      } catch (error) {
        logger.log({
          level: 'error',
          message: `buy ${JSON.stringify(error)}`
        })

        if (error instanceof CreatePaymentError) {
          throw new BaseError({
            message: error.message,
            httpStatus: 503
          })
        }

        throw new BaseError({
          message: JSON.stringify(error),
          httpStatus: 503
        })
      }
    } else if (currentProvider === TransactionProvider.TINKOFF) {
      try {
        payment = await service.payment.tinkoff(data as WithRequired<IPaymentRequest, 'item'>)
      } catch (error) {
        logger.log({
          level: 'error',
          message: `buy ${JSON.stringify(error)}`
        })

        if (error instanceof CreatePaymentError) {
          throw new BaseError({
            message: error.message,
            httpStatus: 503
          })
        }

        throw new BaseError({
          message: JSON.stringify(error),
          httpStatus: 503
        })
      }
    } else if (currentProvider === TransactionProvider.CRYPTO) {
      try {
        payment = await service.payment.crypto.createPayment(data)
      } catch (error) {
        if (isAxiosError(error)) {
          logger.log({
            level: 'error',
            message: `buy ${JSON.stringify(error.response?.data)}`
          })
          throw new BaseError({
            message: error.message,
            httpStatus: 503
          })
        } else {
          logger.log({
            level: 'error',
            message: `buy ${JSON.stringify(error)}`
          })
          throw new BaseError({
            httpStatus: 503,
            code: 'SERVICE_UNAVAILABLE'
          })
        }
      }
    } else if (currentProvider === TransactionProvider.STRIPE) {
      try {
        payment = await service.payment.stripe(data as WithRequired<IPaymentRequest, 'item'>)
      } catch (error: any) {
        logger.log({
          level: 'error',
          message: `buy ${JSON.stringify(error)}`
        })
        throw new BaseError({
          message: error.message,
          httpStatus: 503
        })
      }
    } else {
      throw new InternalError({
        message: 'Unknown payment provider'
      })
    }

    if (!payment) {
      throw new InternalError({
        message: 'Unknown payment provider'
      })
    }

    const transaction = await adapter.transactionRepository.create({
      data: {
        plan_id: planId,
        provider: currentProvider,
        amount: plan.price,
        currency: plan.currency,
        status: TransactionStatus.PENDING,
        type: TransactionType.SUBSCRIPTION,
        user_id: user!.id,
        from_user_id: present ? userId : null,
        external_id: payment.id
      }
    })

    return {
      id: transaction.id,
      url: payment.url!
    }
  }
}
