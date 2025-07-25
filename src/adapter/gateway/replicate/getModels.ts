import { AdapterParams } from '@/adapter/types'
import { ReplicateModel } from '@/lib/clients/replicate'

type Params = Pick<AdapterParams, 'replicate'>

export type GetModels = () => Promise<ReplicateModel[]>

export const buildGetModels = ({ replicate }: Params): GetModels => {
  return async () => {
    const fluxModels = await replicate.client.models.search('flux')
    const stableDiffusionModel = await replicate.client.models.get('stability-ai', 'stable-diffusion-3')
    const veo2Model = await replicate.client.models.get("google", 'veo-2')
    const models = [...fluxModels.results, stableDiffusionModel, veo2Model]
    
    return models.map((model) => ({
      ...model,
      created_at: (model as any).created_at || '',
      features: model?.name === 'veo-2' ? ['TEXT_TO_VIDEO', 'IMAGE_TO_VIDEO'] : ['TEXT_TO_IMAGE']
    }))
  }
}
