import { Response } from 'express'
import { setSSEHeaders } from '@/lib'
import { DeliveryParams } from '@/delivery/types'
import { AuthRequest } from '../types'

type Params = Pick<DeliveryParams, 'model'>

export type AutoUpdateAccountHARFile = (req: AuthRequest, res: Response) => Promise<void>

export const buildAutoUpdateAccountHARFile = ({ model }: Params): AutoUpdateAccountHARFile => {
  return async (req, res) => {
    const { stream, close } = await model.autoUpdateAccountHARFile({
      accountId: req.params.id,
    })
    setSSEHeaders(res)

    const subscription = stream.subscribe({
      next: async (data) => {
        res.write(`${data}`)
      },
      error: (error: unknown) => {
        res.write(`error: ${error || 'unknown'}\n`)
        res.write(`data: ${JSON.stringify(error)}\n\n`)
        res.write('[DONE]')
        res.end()
      },
      complete: () => {
        res.write('[DONE]')
        res.end()
      },
    })

    req.connection.on('close', () => {
      close()
      subscription.unsubscribe()
    })
  }
}
