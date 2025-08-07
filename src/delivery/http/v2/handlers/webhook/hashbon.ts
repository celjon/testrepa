import { Response } from 'express'
import { sha256 } from 'js-sha256'
import { TransactionProvider, TransactionStatus } from '@prisma/client'
import { config } from '@/config'
import { logger } from '@/lib/logger'
import { DeliveryParams } from '@/delivery/types'
import { HashbonRawRequest } from '../types'

type Params = Pick<DeliveryParams, 'webhook'>

export type Hashbon = (req: HashbonRawRequest, res: Response) => Promise<Response>
export const buildHashbon = ({ webhook }: Params): Hashbon => {
  return async (req, res) => {
    const rawData = JSON.stringify(req.body, function (key, value) {
      if (key === 'payFormLink') {
        value = value.replace(/\//g, '\\/')
      }
      return value
    }).replace(/\\\\/g, '\\')

    const sign = sha256(rawData + config.hashbon.secret_key)

    const rawBody = req.rawBody ?? ''
    const rawBodySign = sha256(rawBody + config.hashbon.secret_key)
    const isSignValid = sign === req.header('sign') || rawBodySign === req.header('sign')

    logger.info({
      location: 'webhook.hashbon',
      message: 'Hashbon webhook request',
      rawData,
      rawBody,
      status: req.body.status,
      isSignValid,
      isOldSignValid: sign === req.header('sign'),
      signHeader: req.header('sign'),
      rawDataSign: sign,
      rawBodySign,
    })

    if (req.body.id && isSignValid) {
      const successStatus = 4
      const failStatuses = [0, 5, 6, 7]
      if (req.body.status == successStatus) {
        await webhook.payment({
          paymentId: req.body.id.toString(),
          provider: TransactionProvider.CRYPTO,
          status: TransactionStatus.SUCCEDED,
          meta: req.body,
        })
      } else if (failStatuses.includes(req.body.status)) {
        await webhook.payment({
          paymentId: req.body.id.toString(),
          provider: TransactionProvider.CRYPTO,
          status: TransactionStatus.FAILED,
          meta: req.body,
        })
      }
    }
    return res.status(200).json()
  }
}
