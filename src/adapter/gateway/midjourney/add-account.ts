import { AdapterParams } from '@/adapter/types'

type Params = Pick<AdapterParams, 'midjourneyBalancer'>

export type AddAccount = (params: {
  id: string
  SalaiToken: string
  ServerId: string
  ChannelId: string
}) => Promise<void>

export const buildAddAccount = ({ midjourneyBalancer }: Params): AddAccount => {
  return async (params) => midjourneyBalancer.account.add(params)
}
