import { UseCaseParams } from '@/domain/usecase/types'

export type Parse = () => Promise<void>

export const buildParse = ({ service }: UseCaseParams): Parse => {
  return async () => {
    await service.model.parse()
  }
}
