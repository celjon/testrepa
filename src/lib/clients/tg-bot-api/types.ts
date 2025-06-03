import { IMessage } from '@/domain/entity/message'

export type SendMessageParams = {
  type: 'message'
  message: IMessage
  relatedMessageId: string
}

export type MergeAccountsParams = {
  type: 'merge'
  oldId: string
  newId: string
  email: string | null
  pythonBot?: boolean
}

export type NotifyAboutPresentParams = {
  type: 'present'
  userId: string
  fromUserId: string
  tokens: number
  viaEmail: boolean
}

export type UnlinkAccountParams = {
  type: 'unlink'
  email: string | null
}

export type TgBotApiClient = {
  sendMessage: (data: SendMessageParams) => Promise<void>
  mergeAccounts: (data: MergeAccountsParams) => Promise<void>
  notifyAboutPresent: (data: NotifyAboutPresentParams) => Promise<void>
  unlinkAccount: (data: UnlinkAccountParams) => Promise<void>
}
