import { AuthRequest } from '../types'
import { Response } from 'express'
import { DeliveryParams } from '@/delivery/types'

type Params = Pick<DeliveryParams, 'model'>

export type CreateAccount = (req: AuthRequest, res: Response) => Promise<Response>

export const buildCreateAccount = ({ model }: Params): CreateAccount => {
  return async (req, res) => {
    const account = await model.createAccount({
      ...req.body,
      ...(typeof req.body.mjConcurrency === 'string' && {
        mjConcurrency: +req.body.mjConcurrency
      }),
      disabledAt: req.body.disabled_at === 'null' ? null : typeof req.body.disabled_at === 'string' ? new Date() : undefined,
      ...(req.file && {
        g4fHarFile: req.file
      })
    })

    return res.status(200).json(account)
  }
}
