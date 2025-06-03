import { UseCaseParams } from '@/domain/usecase/types'

export type ResetAccountModels = () => Promise<{
  resettedCount: number
}>

export const buildResetAccountModels =
  ({ service }: UseCaseParams): ResetAccountModels =>
  async () => {
    return await service.model.accountBalancer.g4f.resetAccountModels()
  }
