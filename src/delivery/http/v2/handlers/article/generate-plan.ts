import { Response } from 'express'
import { DeliveryParams } from '@/delivery/types'
import { getLocale, setSSEHeaders } from '@/lib'
import { logger } from '@/lib/logger'
import { AuthRequest } from '../types'

type Params = Pick<DeliveryParams, 'article'>

export type GeneratePlan = (req: AuthRequest, res: Response) => Promise<void>

export const buildGeneratePlan = ({ article }: Params): GeneratePlan => {
  return async (req, res) => {
    const { responseStream$, closeStream } = await article.generatePlan({
      userId: req.user?.id,
      generationMode: req.body.generationMode as string,
      subject: req.body.subject,
      creativity: Number(req.body.creativity),
      locale: getLocale(req.headers['accept-language']),
      model_id: req.body.model_id,
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
        location: 'article.generatePlan',
        message: 'Unexpected sse connection error',
      })
    })

    req.socket.on('close', () => {
      closeStream()
      subscription.unsubscribe()
    })
  }
}
