import { AuthRequest } from '../types'
import { Response } from 'express'
import { DeliveryParams } from '@/delivery/types'
import { logger } from '@/lib/logger'

type Params = Pick<DeliveryParams, 'openai'>
export type Completions = (req: AuthRequest, res: Response) => void

export const buildCompletions = ({ openai }: Params): Completions => {
  return async (req, res) => {
    if (req.body.stream === true) {
      const { responseStream } = await openai.completions.stream({
        userId: req.user?.id,
        params: req.body,
        developerKeyId: req.user?.developerKeyId,
      })

      res.writeHead(200, {
        'Transfer-Encoding': 'chunked',
        Connection: 'keep-alive',
        'Cache-Control': 'no-cache',
        'Content-type': 'text/event-stream',
      })

      req.on('error', () => {
        logger.warn({
          location: 'openai.completions',
          message: 'Unexpected sse connection error',
        })
      })

      const subscription = responseStream.subscribe({
        next: (chunk) => {
          res.write(`data: ${JSON.stringify(chunk)}\n\n`)
        },
        error: (error) => {
          res.write(`error: ${JSON.stringify(error)}\n\n`)
          res.write('[DONE]')
          res.end()
        },
        complete: () => {
          res.write('[DONE]')
          res.end()
        },
      })

      req.socket.on('close', () => {
        subscription.unsubscribe()
      })

      return
    }

    const data = await openai.completions.sync({
      userId: req.user?.id,
      params: req.body,
      developerKeyId: req.user?.developerKeyId,
    })

    return res.status(200).json(data)
  }
}
