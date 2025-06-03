import { IJobInstance } from '@/domain/entity/job'
import { ChatService } from '../chat'
import { Adapter } from '@/domain/types'
import { CreateInstance } from './createInstance'
import { IChat } from '@/domain/entity/chat'
import { Prisma } from '@prisma/client'

type Params = {
  chatService: ChatService
  createInstance: CreateInstance
} & Adapter

export type Create = (
  params: {
    chat: IChat
    user_message_id?: string
    mj_native_message_id?: string | null
  } & Omit<Prisma.JobCreateInput, 'chat'>
) => Promise<IJobInstance>

export const buildCreate =
  ({ chatService, jobRepository, createInstance }: Params): Create =>
  async ({ name, chat, timeout, user_message_id, mj_native_message_id }) => {
    const job = await jobRepository.create({
      data: {
        name,
        chat_id: chat.id,
        timeout,
        user_message_id,
        mj_native_message_id
      }
    })

    job.chat = chat

    chatService.eventStream.emit({
      chat,
      event: {
        name: 'JOB_CREATE',
        data: {
          job
        }
      }
    })

    return createInstance({ job })
  }
