import { Request, Response } from 'express'
import { TransactionProvider, TransactionStatus } from '@prisma/client'
import { DeliveryParams } from '@/delivery/types'

type Params = Pick<DeliveryParams, 'webhook'>

export type Yoomoney = (req: Request, res: Response) => Promise<Response>
export const buildYoomoney = ({ webhook }: Params): Yoomoney => {
  return async (req, res) => {
    const paymentId: string = req.body.object.id
    if (req.body.event === 'payment.succeeded') {
      await webhook.payment({
        paymentId: paymentId,
        provider: TransactionProvider.YOOMONEY,
        status: TransactionStatus.SUCCEDED,
        meta: req.body,
      })
    } else if (req.body.event === 'payment.canceled') {
      await webhook.payment({
        paymentId: paymentId,
        provider: TransactionProvider.YOOMONEY,
        status: TransactionStatus.FAILED,
        meta: req.body,
      })
    }
    return res.status(200).json()
  }
}
