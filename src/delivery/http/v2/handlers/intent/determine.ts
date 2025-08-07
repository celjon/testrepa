import { Request, Response } from 'express'
import { DeliveryParams } from '@/delivery/types'
import { RawFile } from '@/domain/entity/file'
import { logger } from '@/lib/logger'

type Params = Pick<DeliveryParams, 'intent'>

export type DetermineIntent = (req: Request, res: Response) => Promise<void>

export const buildDetermineIntent = (params: Params): DetermineIntent => {
  return async (req: Request, res: Response): Promise<void> => {
    let message: string | undefined = req.body?.message
    let chatId: string | undefined = req.body?.chat_id
    const analyzeIntentFlag: boolean = req.body?.analyze_intent !== false // default true
    const analyzeContextFlag: boolean = req.body?.analyze_context === true // default false
    const analyzeComplexityFlag: boolean = req.body?.analyze_complexity === true // default false
    let audioFile: RawFile | null = null

    const file = req.file
    if (file) {
      audioFile = {
        buffer: file.buffer,
        originalname: file.originalname,
        size: file.size,
        mimetype: file.mimetype,
      }
    }

    logger.info(
      'INTENT REQUEST: chatId=%s, message_preview="%s"',
      chatId || 'NONE',
      (message || '').slice(0, 120)
    )

    const result = await params.intent.determine({
      botSecretKey: req.header('botsecretkey') ?? '',
      message,
      audioFile,
      chatId,
      analyzeIntent: analyzeIntentFlag,
      analyzeContext: analyzeContextFlag,
      analyzeComplexity: analyzeComplexityFlag,
    })

    logger.info(
      'INTENT RESPONSE: chatId=%s, intent=%s, context_reset=%s',
      chatId || 'NONE',
      result.type,
      result.context_reset_needed ?? 'NONE'
    )
    res.status(200).send(result)
  }
}
