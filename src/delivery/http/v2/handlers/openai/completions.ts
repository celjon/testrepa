import { AuthRequest } from '../types'
import { Response } from 'express'
import { DeliveryParams } from '@/delivery/types'
import { logger } from '@/lib/logger'

type Params = Pick<DeliveryParams, 'openai'>
export type Completions = (req: AuthRequest, res: Response) => void

export const buildCompletions = ({ openai }: Params): Completions => {
  return async (req, res) => {
    if (req.body.stream === true) {
      const { responseBytesStream, breakNotifier } = await openai.completions.stream({
        userId: req.user?.id,
        params: req.body
      })

      req.on('error', () => {
        logger.warn({
          location: 'openai.completions',
          message: 'Unexpected sse connection error'
        })
      })

      req.socket.on('close', () => {
        breakNotifier()
      })

      res.writeHead(200, {
        'Transfer-Encoding': 'chunked',
        Connection: 'keep-alive',
        'Cache-Control': 'no-cache'
      })

      responseBytesStream.pipe(res)

      responseBytesStream.on('close', () => {
        res.end()
      })
      return
    }

    const data = await openai.completions.sync({
      userId: req.user?.id,
      params: req.body
    })

    return res.status(200).json(data)
  }
}
