import { IModelAccountQueue } from '@/domain/entity/modelAccountQueue'
import { UseCaseParams } from '@/domain/usecase/types'

export type BalanceAccount = () => Promise<IModelAccountQueue[]>

export const buildBalanceAccount =
  ({ service }: UseCaseParams): BalanceAccount =>
  () =>
    service.model.accountBalancer.balance()
