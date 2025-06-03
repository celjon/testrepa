import { Request, Response } from 'express'
import { sha256 } from 'js-sha256'
import { config } from '@/config'
import { logger } from '@/lib/logger'
import { TransactionProvider, TransactionStatus } from '@prisma/client'
import { DeliveryParams } from '@/delivery/types'

type Params = Pick<DeliveryParams, 'webhook'>

export type Hashbon = (req: Request, res: Response) => Promise<Response>
export const buildHashbon = ({ webhook }: Params): Hashbon => {
  return async (req, res) => {
    const rawData = JSON.stringify(req.body, function (key, value) {
      if (key === 'payFormLink') {
        value = value.replace(/\//g, '\\/')
      }
      return value
    }).replace(/\\\\/g, '\\')

    const sign = sha256(rawData + config.hashbon.secret_key)

    logger.info({
      location: 'webhook.hashbon',
      message: 'Hashbon webhook request',
      rawData,
      status: req.body.status,
      isSignValid: sign === req.header('sign'),
      signHeader: req.header('sign'),
      computedSign: sign
    })

    if (req.body.id && sign === req.header('sign')) {
      const successStatus = 4
      const failStatuses = [0, 5, 6, 7]
      if (req.body.status == successStatus) {
        await webhook.payment({
          paymentId: req.body.id.toString(),
          provider: TransactionProvider.CRYPTO,
          status: TransactionStatus.SUCCEDED,
          meta: req.body
        })
      } else if (failStatuses.includes(req.body.status)) {
        await webhook.payment({
          paymentId: req.body.id.toString(),
          provider: TransactionProvider.CRYPTO,
          status: TransactionStatus.FAILED,
          meta: req.body
        })
      }
    }
    return res.status(200).json()
  }
}
