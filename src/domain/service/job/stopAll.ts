import { IChat } from '@/domain/entity/chat'
import { IJob } from '@/domain/entity/job'
import { Adapter } from '@/domain/types'
import { CreateInstance } from './createInstance'

type Params = {
  createInstance: CreateInstance
} & Adapter

export type StopAll = (params: { chat: IChat }) => Promise<IJob[]>

export const buildStopAll =
  ({ jobRepository, createInstance }: Params): StopAll =>
  async ({ chat }) => {
    const jobs = (
      await jobRepository.list({
        where: {
          chat_id: chat.id
        }
      })
    ).map((job) => createInstance({ job }))

    await Promise.all(jobs.map((job) => job.stop()))

    return jobs.map(({ job }) => job)
  }
