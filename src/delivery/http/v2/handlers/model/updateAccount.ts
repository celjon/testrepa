import { AuthRequest } from '../types'
import { Response } from 'express'
import { DeliveryParams } from '@/delivery/types'
import { ModelAccountStatus } from '@prisma/client'

type Params = Pick<DeliveryParams, 'model'>

export type UpdateAccount = (req: AuthRequest, res: Response) => Promise<Response>

export const buildUpdateAccount = ({ model }: Params): UpdateAccount => {
  return async (req, res) => {
    const account = await model.updateAccount({
      ...req.body,
      id: req.params.id,
      ...(typeof req.body.mjConcurrency === 'string' && {
        mjConcurrency: +req.body.mjConcurrency
      }),
      disabledAt: req.body.disabled_at === 'null' ? null : typeof req.body.disabled_at === 'string' ? new Date() : undefined,
      ...(req.body.status && {
        status: req.body.status as ModelAccountStatus
      }),
      ...(req.file && {
        g4fHarFile: req.file
      })
    })

    return res.status(200).json(account)
  }
}
