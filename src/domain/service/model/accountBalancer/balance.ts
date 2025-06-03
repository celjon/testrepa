import { IModelAccountQueue, modelAccountQueueInclude } from '@/domain/entity/modelAccountQueue'
import { Adapter } from '@/domain/types'
import { G4FService } from './g4f'
import { MidjourneyService } from './midjourney'

type Params = Adapter & {
  g4f: G4FService
  midjourney: MidjourneyService
}

export type Balance = () => Promise<IModelAccountQueue[]>

export const buildBalance =
  ({ g4f, midjourney, modelAccountQueueRepository }: Params): Balance =>
  async () => {
    await Promise.all([
      g4f.balance({
        g4fAccount: null,
        g4fAccountModel: null,
        generationStart: 0
      }),
      midjourney.balance()
    ])

    return modelAccountQueueRepository.list({
      include: modelAccountQueueInclude
    })
  }
