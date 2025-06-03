import { Request, Response } from 'express'
import { DeliveryParams } from '@/delivery/types'

type Params = Pick<DeliveryParams, 'auth'>

export type GetOAuthConsentURL = (req: Request, res: Response) => Promise<Response>

export const buildGetOAuthConsentURL = ({ auth }: Params): GetOAuthConsentURL => {
  return async (req, res) => {
    const data = await auth.getOAuthConsentURL({
      provider: req.query.provider as string,
      redirect_uri: req.query.redirect_uri as string
    })

    return res.status(200).json(data)
  }
}
