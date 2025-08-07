import { AdapterParams } from '@/adapter/types'

type Params = Pick<AdapterParams, 'openaiBalancer'>

export type ListModels = () => Promise<any>
export const buildListModels = ({ openaiBalancer }: Params): ListModels => {
  return async () => {
    return openaiBalancer.next().client.models.list()
  }
}
