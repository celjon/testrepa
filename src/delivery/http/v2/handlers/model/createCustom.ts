import { AuthRequest } from '../types'
import { Response } from 'express'
import { DeliveryParams } from '@/delivery/types'

type Params = Pick<DeliveryParams, 'model'>

export type CreateCustom = (req: AuthRequest, res: Response) => Promise<Response>

export const buildCreateCustom = ({ model }: Params): CreateCustom => {
  return async (req, res) => {
    const custom = await model.createCustom({
      ...req.body,
      ...(req.body.discount && {
        discount: +req.body.discount
      }),
      ...(req.body.disabled && {
        disabled: Boolean(+req.body.disabled)
      }),
      ...(req.file && {
        icon: req.file
      })
    })

    return res.status(200).json(custom)
  }
}
