import { Response } from 'express'
import { getLocale } from '@/lib'
import { DeliveryParams } from '@/delivery/types'
import { AuthRequest } from '../types'
import { convertSentPlatform } from '@/domain/entity/action'

type Params = Pick<DeliveryParams, 'message'>
export type PromptQueue = (req: AuthRequest, res: Response) => Promise<Response>
export type Prompt = { message: string; context: boolean; modelId: string }

export const buildPromptQueue =
  ({ message }: Params): PromptQueue =>
  async (req, res) => {
    const prompts: Prompt[] = Array.isArray(req.body.prompts) ? req.body.prompts : []
    const platform = convertSentPlatform(req.query?.platform ?? req.body?.platform)
    const locale = getLocale(req.headers['accept-language'])

    const { queueId } = await message.promptQueue({
      prompts,
      userId: req.user!.id,
      keyEncryptionKey: req.user!.keyEncryptionKey,
      chatId: req.body.chatId,
      platform,
      locale
    })
    return res.status(200).json({ queueId })
  }
