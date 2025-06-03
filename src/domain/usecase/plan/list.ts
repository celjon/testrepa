import { UseCaseParams } from '@/domain/usecase/types'
import { IPlan } from '@/domain/entity/plan'

export type List = () => Promise<Array<IPlan> | never>
export const buildList = ({ adapter }: UseCaseParams): List => {
  return async () => {
    const plans = await adapter.planRepository.list({
      orderBy: [{ currency: 'asc' }, { price: 'asc' }],
      include: {
        models: {
          include: {
            model: {
              include: {
                icon: true
              }
            }
          },
          orderBy: {
            model: {
              order: 'asc'
            }
          }
        }
      }
    })

    return plans
  }
}
