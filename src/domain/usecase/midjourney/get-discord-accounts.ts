import { IMidjourneyDiscordAccount } from '@/domain/entity/midjourney-discord-account'
import { UseCaseParams } from '@/domain/usecase/types'

export type GetDiscordAccounts = () => Promise<IMidjourneyDiscordAccount[]>

export const buildGetDiscordAccounts =
  ({ adapter }: UseCaseParams): GetDiscordAccounts =>
  async () =>
    adapter.midjourneyDiscordAccountRepository.list({
      orderBy: {
        order: 'asc',
      },
    })
