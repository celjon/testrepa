import { DeliveryParams } from '@/delivery/types'
import { AuthRequest } from '../types'
import { Response } from 'express'
import { setSSEHeaders } from '@/lib'

type Params = Pick<DeliveryParams, 'chat'>

export type Stream = (req: AuthRequest, res: Response) => Promise<Response>

export const buildStream =
  ({ chat }: Params): Stream =>
  async (req, res) => {
    const chatEventStream = await chat.stream({
      userId: req.user?.id,
      chatId: req.params.id
    })
    setSSEHeaders(res)

    const subscription = chatEventStream.subject.subscribe({
      next: (event) => {
        res.write(`data: ${JSON.stringify(event)}\n\n`)
      },
      complete: () => {
        res.end()
      }
    })

    res.on('close', () => {
      chatEventStream.close({ subscription })
      res.end()
    })

    return res
  }
