import { DeliveryParams } from '@/delivery/types'
import { AuthRequest } from '../types'
import { Response } from 'express'
import { setSSEHeaders } from '@/lib'

type Params = Pick<DeliveryParams, 'message'>

export type PromptQueueStream = (req: AuthRequest, res: Response) => Promise<Response>

export const buildPromptQueueStream =
  ({ message }: Params): PromptQueueStream =>
  async (req, res) => {
    const promptQueueEventStream = await message.promptQueueStream({
      userId: req.user?.id,
      queueId: req.params.id,
    })
    setSSEHeaders(res)

    const subscription = promptQueueEventStream.subject.subscribe({
      next: (event) => {
        res.write(`data: ${JSON.stringify(event)}\n\n`)
      },
      complete: () => {
        res.end()
      },
    })

    res.on('close', () => {
      promptQueueEventStream.close({ subscription })
      res.end()
    })

    return res
  }
