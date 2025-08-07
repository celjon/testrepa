import { IChat } from '@/domain/entity/chat'
import { IJob } from '@/domain/entity/job'
import { Adapter } from '@/domain/types'

type Params = Adapter

export type List = (params: { chat: IChat }) => Promise<IJob[]>

export const buildList =
  ({ jobRepository }: Params): List =>
  async ({ chat }) => {
    const jobs = await jobRepository.list({
      where: {
        chat_id: chat.id,
      },
      include: {
        chat: true,
      },
    })

    return jobs
  }
