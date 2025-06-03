import { IJob } from '@/domain/entity/job'
import { NotFoundError } from '@/domain/errors'
import { UseCaseParams } from '@/domain/usecase/types'

export type GetJobs = (params: { userId: string; chatId: string }) => Promise<IJob[]>

export const buildGetJobs =
  ({ adapter, service }: UseCaseParams): GetJobs =>
  async ({ userId, chatId }) => {
    const chat = await adapter.chatRepository.get({
      where: {
        id: chatId,
        user_id: userId,
        deleted: false
      }
    })

    if (!chat) {
      throw new NotFoundError()
    }

    const jobs: IJob[] = await service.job.list({
      chat
    })

    return jobs
  }
