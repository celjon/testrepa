import { Request, Response } from 'express'
import { TransactionProvider, TransactionStatus } from '@prisma/client'
import { DeliveryParams } from '@/delivery/types'

type Params = Pick<DeliveryParams, 'webhook'>

export type Tinkoff = (req: Request, res: Response) => Promise<Response>
export const buildTinkoff = ({ webhook }: Params): Tinkoff => {
  return async (req, res) => {
    const paymentId: string = req.body.PaymentId.toString()
    if (req.body.Status === 'CONFIRMED') {
      await webhook.payment({
        paymentId: paymentId,
        provider: TransactionProvider.TINKOFF,
        status: TransactionStatus.SUCCEDED,
        meta: req.body,
      })
    } else if (req.body.Status === 'REJECTED') {
      await webhook.payment({
        paymentId: paymentId,
        provider: TransactionProvider.TINKOFF,
        status: TransactionStatus.FAILED,
        meta: req.body,
      })
    }
    return res.status(200).json()
  }
}
