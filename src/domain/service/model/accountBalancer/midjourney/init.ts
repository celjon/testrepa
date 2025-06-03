import { Adapter } from '@/adapter'

type Params = Pick<Adapter, 'midjourneyGateway' | 'modelAccountRepository'>

export type Init = () => Promise<void>

export const buildInit = ({ midjourneyGateway, modelAccountRepository }: Params): Init => {
  return async () => {
    const accounts = await modelAccountRepository.list()

    await midjourneyGateway.init({ accounts })
  }
}
