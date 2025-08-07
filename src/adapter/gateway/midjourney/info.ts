import { AdapterParams } from '@/adapter/types'
import { MidjourneyInfo } from '@/lib/clients/midjourney-api'
import { NotFoundError } from '@/domain/errors'

type Params = Pick<AdapterParams, 'midjourneyBalancer'>

export type Info = (params: { accountId: string }) => Promise<MidjourneyInfo | null>

export const buildInfo = ({ midjourneyBalancer }: Params): Info => {
  return async ({ accountId }) => {
    const account = midjourneyBalancer.findById(accountId)

    if (!account)
      throw new NotFoundError({
        code: 'MIDJOURNEY_ACCOUNT_NOT_FOUND',
      })

    return await account.info()
  }
}
