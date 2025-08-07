import { Job } from 'bullmq'
import { lastValueFrom } from 'rxjs'
import { getErrorString } from '@/lib'
import { logger } from '@/lib/logger'
import { CreateQueueWorker, Queues, UpdateModelAccountHARFileJob } from '@/queues/types'
import { DeliveryParams } from '../../types'
import { ModelAccountStatus } from '@prisma/client'

type Params = DeliveryParams

export const startUpdateModelAccountHARFilesQueue = async (
  params: Params,
  queues: Queues,
  createWorker: CreateQueueWorker,
) => {
  await queues.updateModelAccountHARFiles.setGlobalConcurrency(1)

  createWorker(
    queues.updateModelAccountHARFiles.name,
    async (job: Job<UpdateModelAccountHARFileJob>) => {
      try {
        const modelAccount = await params.modelAccountRepository.get({
          where: { id: job.data.modelAccountId },
        })
        logger.info({
          location: 'startUpdateModelAccountHARFilesQueue',
          message: `Updating HAR file for account ${modelAccount?.name}`,
        })

        if (!modelAccount || modelAccount?.disabled_at) {
          return
        }
        if (modelAccount.status === ModelAccountStatus.ACTIVE) {
          return
        }

        const timeBetweenUpdatesMs = 60 * 60 * 1000
        if (
          modelAccount.g4f_har_file_updated_at &&
          modelAccount.g4f_har_file_updated_at.getTime() + timeBetweenUpdatesMs >
            new Date().getTime()
        ) {
          return
        }

        const response = await params.model.autoUpdateAccountHARFile({
          accountId: job.data.modelAccountId,
        })

        await lastValueFrom(response.stream)
      } catch (e) {
        logger.info({
          location: 'startUpdateModelAccountHARFilesQueue',
          message: getErrorString(e),
        })
      }
    },
    {
      concurrency: 1,
    },
  )
}
