import { NotFoundError } from '@/domain/errors'
import { withTimeout } from '@/lib'
import { newMidjourneyApi } from '@/lib/clients/midjourney-api'
import { config as projectConfig } from '@/config/config'


export type Describe = (params: {
  config: {
    accountId: string
    SalaiToken: string
    ServerId: string
    ChannelId: string
  }
  url: string
}) => Promise<{
  content: string
} | null>

export const buildDescribe = (): Describe => {
  return async ({ config, url }) => {
    const { client } = newMidjourneyApi(config)

    if (!client)
      throw new NotFoundError({
        code: 'MIDJOURNEY_ACCOUNT_NOT_FOUND'
      })

    const result = await withTimeout(client.describe({ url }), projectConfig.timeouts.midjourney_describe)

    if (!result) return null

    return {
      content: result.descriptions?.join(' \n').replace('1️⃣', '1.').replace('2️⃣', '2.').replace('3️⃣', '3.').replace('4️⃣', '4.')
    }
  }
}
