import { EventEmitter } from 'events'
import { Send } from './send'
import { Get } from './get'
import { UpdateSettings } from '@/domain/usecase/chat/update-settings'
import { UseCaseParams } from '@/domain/usecase/types'
import { config } from '@/config'
import { Platform } from '@prisma/client'
import { ProgressEventPayload } from '@/domain/entity/prompt-queue-event'
import { PromptItem } from '@/domain/entity/prompt-item'

type Params = UseCaseParams & {
  send: Send
  get: Get
  updateChatSettings: UpdateSettings
}

export type ChatPromptQueue = (params: {
  prompts: PromptItem[]
  userId: string
  keyEncryptionKey: string | null
  chatId: string
  locale: string
  developerKeyId?: string
}) => Promise<{
  queueId: string
  progressEmitter: EventEmitter
}>

const maxQueuesPerUser = config.promptQueue.maxQueuesPerUser

export const buildChatPromptQueue =
  ({ adapter, send, get, updateChatSettings, service }: Params): ChatPromptQueue =>
  async ({ prompts, userId, keyEncryptionKey, chatId, locale, developerKeyId }) => {
    let isCancelled = false
    let queueId!: string

    const progressEmitter = new EventEmitter()

    const cancelFn = async () => {
      isCancelled = true
      await adapter.promptQueuesRepository.removePromptQueue({ userId, queueId })
      emitProgress({ error: 'cancelled' })
      progressEmitter.emit('end')
      await adapter.chatRepository.update({ where: { id: chatId }, data: { queue_id: null } })
    }

    queueId = await adapter.promptQueuesRepository.createPromptQueue({
      userId,
      cancelFn,
      maxQueuesPerUser,
    })

    const emitProgress = (data: ProgressEventPayload) => {
      progressEmitter.emit('progress', data)
      service.message.eventStream.promptQueueEmit({
        queueId,
        event: data,
      })
    }

    async function processPrompts() {
      let lastSettings: { include_context: boolean; model: string } | null = null
      const totalPrompts = prompts.length

      for (let idx = 0; idx < totalPrompts; idx++) {
        if (isCancelled) break
        const prefix = `[${idx + 1}/${totalPrompts}]\n`
        const { message, include_context, modelId } = prompts[idx]
        const currentSettings = { include_context, model: modelId }

        if (
          !lastSettings ||
          lastSettings.include_context !== currentSettings.include_context ||
          lastSettings.model !== currentSettings.model
        ) {
          try {
            await updateChatSettings({ userId, chatId, values: currentSettings })
            lastSettings = currentSettings
          } catch (err: any) {
            emitProgress({
              donePrompts: idx + 1,
              totalPrompts,
              error: err.message || err.code || 'settings_error',
            })
          }
        }

        try {
          const req = await send({
            userId,
            keyEncryptionKey,
            chatId,
            message: prefix + message,
            files: [],
            voiceFile: null,
            videoFile: null,
            platform: Platform.PROMPT_QUEUE,
            locale,
            stream: false,
            developerKeyId,
            prefix,
          })

          let resp
          do {
            if (isCancelled) break
            resp = await get({ userId, keyEncryptionKey, id: req.id })
            if (resp.status === 'PENDING') {
              await new Promise((r) => setTimeout(r, 300))
            }
          } while (resp.status === 'PENDING')

          emitProgress({ donePrompts: idx + 1, totalPrompts })
        } catch (err: any) {
          emitProgress({
            donePrompts: idx + 1,
            totalPrompts,
            error: err.message || err.code || 'prompt_error',
          })
        }
      }

      await adapter.promptQueuesRepository.removePromptQueue({ userId, queueId })
      emitProgress({ donePrompts: totalPrompts, totalPrompts, done: true })
      await adapter.chatRepository.update({ where: { id: chatId }, data: { queue_id: null } })
    }

    //DONT_AWAIT_THIS
    processPrompts()

    return { queueId, progressEmitter }
  }
