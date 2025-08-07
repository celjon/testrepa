import { UseCaseParams } from '@/domain/usecase/types'
import { buildCreate, Create } from './create'
import { buildActivate, Activate } from '@/domain/usecase/gift-certificate/activate'

export type GiftCertificateUseCase = {
  create: Create
  activate: Activate
}

export const buildGiftCertificateUseCase = (params: UseCaseParams): GiftCertificateUseCase => {
  const create = buildCreate(params)
  const activate = buildActivate(params)
  return {
    create,
    activate,
  }
}
