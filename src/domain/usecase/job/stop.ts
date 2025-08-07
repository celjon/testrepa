import { IJob } from '@/domain/entity/job'
import { UseCaseParams } from '../types'
import { NotFoundError } from '@/domain/errors'

export type Stop = (params: { jobId: string; userId: string }) => Promise<IJob>

export const buildStop =
  ({ service, adapter }: UseCaseParams): Stop =>
  async ({ jobId, userId }) => {
    const job = await adapter.jobRepository.get({
      where: {
        id: jobId,
      },
      include: {
        chat: true,
      },
    })

    if (!job || !job.chat || job.chat.user_id !== userId) {
      throw new NotFoundError({
        code: 'JOB_NOT_FOUND',
      })
    }

    await service.job.createInstance({ job }).stop()

    return job
  }
