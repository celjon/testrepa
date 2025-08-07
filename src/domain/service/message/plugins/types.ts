import { Platform } from '@prisma/client'
import { IChatSettings } from '@/domain/entity/chat-settings'
import { IJobInstance } from '@/domain/entity/job'
import { IMessage } from '@/domain/entity/message'
import { IModel } from '@/domain/entity/model'
import { IUser } from '@/domain/entity/user'
import { ISubscription } from '@/domain/entity/subscription'
import { IEmployee } from '@/domain/entity/employee'

export type LLMPluginParams = {
  user: IUser
  employee: IEmployee | null
  keyEncryptionKey: string | null
  chatId: string
  messages: IMessage[]
  settings: IChatSettings
  job: IJobInstance
  model: IModel
  prompt: string
  locale?: string
  platform?: Platform
  sentPlatform?: Platform
  subscription: ISubscription
  assistantMessage?: IMessage
}

export type LLMPluginResult = Promise<{
  promptAddition: string
  systemPromptAddition: string
  caps: number
}>

export type LLMPlugin = (params: LLMPluginParams) => LLMPluginResult
