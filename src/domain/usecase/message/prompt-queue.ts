import { Send } from './send'
import { Get } from './get'
import { UpdateSettings } from '@/domain/usecase/chat/update-settings'
import { Platform } from '@prisma/client'
import { UseCaseParams } from '@/domain/usecase/types'
import { config } from '@/config'
type Params = UseCaseParams & {
  send: Send
  get: Get
  updateChatSettings: UpdateSettings
}

export interface PromptItem {
  message: string
  context: boolean
  modelId: string
}

export type PromptQueue = (params: {
  prompts: PromptItem[]
  userId: string
  keyEncryptionKey: string | null
  chatId: string
  platform?: Platform
  locale: string
}) => Promise<{
  queueId: string
}>

const maxQueuesPerUser = config.promptQueue.maxQueuesPerUser

export const buildPromptQueue =
  ({ adapter, send, get, updateChatSettings }: Params): PromptQueue =>
  async (params) => {
    const { prompts, userId, keyEncryptionKey, chatId, platform, locale } = params

    let isCancelled = false
    const cancelFn = async () => {
      isCancelled = true
      await adapter.promptQueuesRepository.removePromptQueue({ userId, queueId })
    }

    async function processPrompts() {
      let lastSettings = null
      for (let index = 0; index < prompts.length; index++) {
        if (isCancelled) break

        const { message, context, modelId } = prompts[index]
        const currentSettings = { include_context: context, model: modelId }

        if (
          !lastSettings ||
          lastSettings.include_context !== currentSettings.include_context ||
          lastSettings.model !== currentSettings.model
        ) {
          await updateChatSettings({ userId, chatId, values: currentSettings })
          lastSettings = currentSettings
        }
        const request = await send({
          userId,
          keyEncryptionKey,
          chatId,
          message,
          files: [],
          voiceFile: null,
          videoFile: null,
          platform,
          locale,
          stream: true
        })

        let response
        do {
          if (isCancelled) break
          response = await get({ userId, keyEncryptionKey, id: request.id })
          if (response.status === 'PENDING') {
            await new Promise((r) => setTimeout(r, 300))
          }
        } while (response.status === 'PENDING')
      }

      await adapter.promptQueuesRepository.removePromptQueue({ userId, queueId })
    }
    const queueId = await adapter.promptQueuesRepository.createPromptQueue({ userId, cancelFn, maxQueuesPerUser })

    //DONT_AWAIT_THIS
    processPrompts()

    return { queueId }
  }
