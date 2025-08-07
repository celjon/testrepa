import { logger } from '@/lib/logger'
import { getErrorString } from '@/lib'
import { Adapter } from '@/domain/types'
import { IModelAccountQueue, modelAccountQueueInclude } from '@/domain/entity/model-account-queue'
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
      g4f
        .balance({
          requestId: null,
          account: null,
          accountModel: null,
          generationStart: 0,
        })
        .catch((err) => {
          logger.error({
            location: 'service.model.accountBalancer.balance (g4f)',
            message: getErrorString(err),
          })
        }),
      midjourney.balance().catch((err) => {
        logger.error({
          location: 'service.model.accountBalancer.balance (midjourney)',
          message: getErrorString(err),
        })
      }),
    ])

    return modelAccountQueueRepository.list({
      include: modelAccountQueueInclude,
    })
  }
