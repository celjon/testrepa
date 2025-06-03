import { Response } from 'express'
import { DeliveryParams } from '@/delivery/types'
import { getLocale, setSSEHeaders } from '@/lib'
import { logger } from '@/lib/logger'
import { AuthRequest } from '../types'

type Params = Pick<DeliveryParams, 'article'>

export type AddChapterToPlan = (req: AuthRequest, res: Response) => Promise<void>

export const buildAddChapterToPlan = ({ article }: Params): AddChapterToPlan => {
  return async (req, res) => {
    const { responseStream$, closeStream } = await article.addChapterToPlan({
      userId: req.user?.id,
      generationMode: req.body.generationMode,
      subject: req.body.subject,
      plan: req.body.plan,
      locale: getLocale(req.headers['accept-language']),
      creativity: Number(req.body.creativity),
      model_id: req.body.model_id,
      chapter: req.body.chapter
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
      }
    })

    req.on('error', () => {
      logger.warn({
        location: 'article.addChapterToPlan',
        message: 'Unexpected sse connection error'
      })
    })

    req.socket.on('close', () => {
      closeStream()
      subscription.unsubscribe()
    })
  }
}
