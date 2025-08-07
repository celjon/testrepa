import { UseCaseParams } from '@/domain/usecase/types'
import { PlanCurrency, IPlan } from '@/domain/entity/plan'

export type List = (params: {
  includePlanModels?: boolean
  currency?: PlanCurrency
}) => Promise<Array<IPlan> | never>

export const buildList = ({ adapter }: UseCaseParams): List => {
  return async ({ includePlanModels = true, currency }) => {
    const plans = await adapter.planRepository.list({
      orderBy: [{ currency: 'asc' }, { price: 'asc' }],
      include: includePlanModels
        ? {
            models: {
              include: {
                model: {
                  include: {
                    icon: true,
                  },
                },
              },
              orderBy: {
                model: {
                  order: 'asc',
                },
              },
            },
          }
        : undefined,
      where: currency
        ? {
            currency,
          }
        : undefined,
    })

    return plans
  }
}
