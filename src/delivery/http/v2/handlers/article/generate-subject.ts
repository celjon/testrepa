import { Response } from 'express'
import { DeliveryParams } from '@/delivery/types'
import { getLocale, setSSEHeaders } from '@/lib'
import { AuthRequest } from '../types'
import { logger } from '@/lib/logger'

type Params = Pick<DeliveryParams, 'article'>

export type GenerateSubject = (req: AuthRequest, res: Response) => Promise<void>

export const buildGenerateSubject = ({ article }: Params): GenerateSubject => {
  return async (req, res) => {
    const { responseStream$, closeStream } = await article.generateSubject({
      model_id: req.body.model_id as string,
      userId: req.user?.id,
      locale: getLocale(req.headers['accept-language']),
      generationMode: req.body.generationMode as string,
      developerKeyId: req.user.developerKeyId,
    })

    setSSEHeaders(res)

    const subscription = responseStream$.subscribe({
      next: (data) => {
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
        location: 'article.generateSubject',
        message: 'Unexpected sse connection error',
      })
    })

    req.socket.on('close', () => {
      closeStream()
      subscription.unsubscribe()
    })
  }
}
