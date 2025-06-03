import { AdapterParams } from '@/adapter/types'
import { IOpenAIModel } from '@/lib/clients/openai.client'

type Params = Pick<AdapterParams, 'openaiBalancer'>

export type GetModels = () => Promise<IOpenAIModel[]>

export const buildGetModels =
  ({ openaiBalancer }: Params): GetModels =>
  async () =>
    (await openaiBalancer.next().client.models.list()).data
