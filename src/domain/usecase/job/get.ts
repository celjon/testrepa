import { IJob } from '@/domain/entity/job'
import { UseCaseParams } from '../types'
import { NotFoundError } from '@/domain/errors'

export type Get = (params: { jobId: string; userId: string }) => Promise<IJob>

export const buildGet =
  ({ adapter }: UseCaseParams): Get =>
  async ({ jobId, userId }) => {
    const job = await adapter.jobRepository.get({
      where: {
        id: jobId,
        chat: {
          user_id: userId,
        },
      },
    })

    if (!job) {
      throw new NotFoundError({
        code: 'JOB_NOT_FOUND',
      })
    }

    return job
  }
