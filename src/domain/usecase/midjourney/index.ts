import { UseCaseParams } from '@/domain/usecase/types'
import { buildGetDiscordAccounts, GetDiscordAccounts } from './get-discord-accounts'

export type MidjourneyUseCase = {
  getDiscordAccounts: GetDiscordAccounts
}

export const buildMidjourneyUseCase = (params: UseCaseParams): MidjourneyUseCase => {
  const getDiscordAccounts = buildGetDiscordAccounts(params)

  return {
    getDiscordAccounts
  }
}
