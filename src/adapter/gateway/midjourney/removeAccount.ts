import { AdapterParams } from '@/adapter/types'

type Params = Pick<AdapterParams, 'midjourneyBalancer'>

export type RemoveAccount = (params: { id: string }) => Promise<void>

export const buildRemoveAccount = ({ midjourneyBalancer }: Params): RemoveAccount => {
  return async (params) => midjourneyBalancer.account.remove(params)
}
