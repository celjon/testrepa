import { Response } from 'express'
import { logger } from '@/lib/logger'
import { DeliveryParams } from '@/delivery/types'
import { AuthRequest } from '../types'

type Params = Pick<DeliveryParams, 'aiTools'>

export type Completions = (req: AuthRequest, res: Response) => void

export const buildCompletions = ({ aiTools }: Params): Completions => {
  return async (req, res) => {
    if (req.body.stream === true) {
      const { responseBytesStream, breakNotifier } = await aiTools.completions.stream({
        userId: req.user?.id,
        params: req.body
      })

      req.on('error', () => {
        logger.warn({
          location: 'aitools.completions.stream',
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

    const data = await aiTools.completions.sync({
      userId: req.user?.id,
      params: req.body
    })

    return res.status(200).json(data)
  }
}
