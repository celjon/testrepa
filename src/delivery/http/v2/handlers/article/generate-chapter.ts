import { Response } from 'express'
import { DeliveryParams } from '@/delivery/types'
import { setSSEHeaders } from '@/lib'
import { logger } from '@/lib/logger'
import { AuthRequest } from '../types'

type Params = Pick<DeliveryParams, 'article'>

export type GenerateChapter = (req: AuthRequest, res: Response) => Promise<void>

export const buildGenerateChapter = ({ article }: Params): GenerateChapter => {
  return async (req, res) => {
    const { responseStream$, closeStream } = await article.generateChapter({
      userId: req.user?.id,
      keyEncryptionKey: req.user?.keyEncryptionKey,
      articleId: req.body.articleId,
      model_id: req.body.model_id,
      creativity: req.body.creativity,
      chapterPrompt: req.body.chapterPrompt,
      language: req.body.language,
    })

    setSSEHeaders(res)
    const subscription = responseStream$.subscribe({
      next: async (asyncData) => {
        const data = asyncData
        res.write(`data: ${JSON.stringify(data)}\n\n`)

        if (data.status === 'done') {
          res.write('[DONE]')
          res.end()
        }
      },
      error: (error) => {
        res.write(`error: ${error?.message || 'unknown'}\n`)
        res.write(`data: ${JSON.stringify(error)}\n\n`)
        res.write('[DONE]')
        res.end()
      },
    })

    req.on('error', () => {
      logger.warn({
        location: 'article.generateChapter',
        message: 'Unexpected sse connection error',
      })
    })

    req.socket.on('close', () => {
      closeStream()
      subscription.unsubscribe()
    })
  }
}
