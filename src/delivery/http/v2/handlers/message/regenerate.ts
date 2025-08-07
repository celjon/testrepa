import { Response } from 'express'
import { DeliveryParams } from '@/delivery/types'
import { AuthRequest } from '../types'
import { getLocale } from '@/lib'
import { convertSentPlatform } from '@/domain/entity/action'

type Params = Pick<DeliveryParams, 'message'>

export type Regenerate = (req: AuthRequest, res: Response) => Promise<Response>

export const buildRegenerate =
  ({ message }: Params): Regenerate =>
  async (req, res) => {
    const job = await message.regenerate({
      userId: req.user?.id,
      keyEncryptionKey: req.user?.keyEncryptionKey,
      messageId: req.body.id,
      platform: convertSentPlatform(req.query?.platform ?? req.body?.platform),
      userMessageId: req.body?.userMessageId,
      locale: getLocale(req.headers['accept-language']),
    })

    return res.status(201).send(job)
  }
