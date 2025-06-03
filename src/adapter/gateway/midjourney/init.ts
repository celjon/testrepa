import { AdapterParams } from '@/adapter/types'
import { IModelAccount } from '@/domain/entity/modelAccount'

type Params = Pick<AdapterParams, 'midjourneyBalancer'>

export type Init = (params: { accounts: Array<IModelAccount> }) => Promise<void>

export const buildInit = ({ midjourneyBalancer }: Params): Init => {
  return async ({ accounts }) => {
    accounts.forEach(({ id, mj_channel_id, mj_server_id, mj_token }) => {
      if (!midjourneyBalancer.findById(id) && mj_channel_id && mj_server_id && mj_token) {
        midjourneyBalancer.account.add({
          id,
          ChannelId: mj_channel_id,
          ServerId: mj_server_id,
          SalaiToken: mj_token
        })
      }
    })
  }
}
