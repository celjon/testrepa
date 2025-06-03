import { UseCaseParams } from '@/domain/usecase/types'

export type DeleteAccountModel = (params: { id: string }) => Promise<void>

export const buildDeleteAccountModel =
  ({ adapter }: UseCaseParams): DeleteAccountModel =>
  async ({ id }) => {
    await adapter.modelAccountModelRepository.deleteMany({
      where: { id }
    })
  }
