import { UseCaseParams } from '@/domain/usecase/types'

export type Init = () => Promise<void>

export const buildInit = ({ service }: UseCaseParams): Init => {
  return async () => {
    await service.model.accountBalancer.midjourney.init()
  }
}
