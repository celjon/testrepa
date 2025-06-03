import { Adapter, AuthRepository } from '@/domain/types'

export type MergeAccountsInTgBot = AuthRepository['mergeAccountsInTgBot']
export const buildMergeAccountsInTgBot = ({ authRepository }: Adapter): MergeAccountsInTgBot => {
  return async (data) => {
    await authRepository.mergeAccountsInTgBot(data)
  }
}
