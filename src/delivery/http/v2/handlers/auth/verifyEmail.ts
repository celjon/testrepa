import { Request, Response } from 'express'
import { DeliveryParams } from '@/delivery/types'

type Params = Pick<DeliveryParams, 'auth'>

export type VerifyEmailHandler = (request: Request, response: Response) => Promise<void>

export const buildVerifyEmailHandler = ({ auth }: Params): VerifyEmailHandler => {
  return async (req, res) => {
    await auth.verifyEmail({
      userId: req.body.userId,
      verificationCode: req.body.verificationCode
    })
    res.status(200).json({})
  }
}
