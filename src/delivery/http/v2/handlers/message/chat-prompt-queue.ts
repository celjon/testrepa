import { Response } from 'express'
import { getLocale, setSSEHeaders } from '@/lib'
import { DeliveryParams } from '@/delivery/types'
import { AuthRequest } from '../types'
import { config } from '@/config'
import { IPromptQueueEvent } from '@/domain/entity/prompt-queue-event'
import { PromptItem } from '@/domain/entity/prompt-item'

type Params = Pick<DeliveryParams, 'message' | 'chat'>

export type ChatPromptQueue = (req: AuthRequest, res: Response) => Promise<void>

export const buildChatPromptQueue = ({ message, chat }: Params): ChatPromptQueue => {
  return async (req, res) => {
    let prompts: PromptItem[] = Array.isArray(req.body.prompts) ? req.body.prompts : []
    if (prompts.length > config.promptQueue.maxPromptsPerQueue) {
      prompts = prompts.slice(0, config.promptQueue.maxPromptsPerQueue)
    }
    const locale = getLocale(req.headers['accept-language'])

    setSSEHeaders(res)

    const { queueId, progressEmitter } = await message.chatPromptQueue({
      prompts,
      userId: req.user!.id,
      keyEncryptionKey: req.user!.keyEncryptionKey,
      chatId: req.body.chatId,
      locale,
      developerKeyId: req.user!.developerKeyId,
    })

    await chat.update({ userId: req.user!.id, id: req.body.chatId, queue_id: queueId })
    res.write(`data: ${JSON.stringify({ queueId })}\n\n`)

    const onProgress = (data: IPromptQueueEvent) => {
      if (!res.writableEnded) {
        res.write(`data: ${JSON.stringify(data)}\n\n`)
        if (data.done) {
          res.end()
        }
      }
    }
    const cleanup = () => {
      progressEmitter.off('progress', onProgress)
      progressEmitter.off('end', onProgress)
    }

    progressEmitter.on('progress', onProgress)
    progressEmitter.on('end', onProgress)

    req.socket.on('close', () => {
      cleanup()
    })
  }
}
