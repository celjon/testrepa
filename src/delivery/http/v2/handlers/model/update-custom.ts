import { AuthRequest } from '../types'
import { Response } from 'express'
import { DeliveryParams } from '@/delivery/types'

type Params = Pick<DeliveryParams, 'model'>

export type UpdateCustom = (req: AuthRequest, res: Response) => Promise<Response>

export const buildUpdateCustom = ({ model }: Params): UpdateCustom => {
  return async (req, res) => {
    const custom = await model.updateCustom({
      ...req.body,
      customId: req.params.id,
      ...(req.body.discount && {
        discount: +req.body.discount,
      }),
      ...(req.body.order && {
        order: +req.body.order,
      }),
      ...(req.body.disabled && {
        disabled: Boolean(+req.body.disabled),
      }),
      ...(req.file &&
        req.file.size > 0 && {
          icon: req.file,
        }),
      ...(req.file &&
        req.file.size === 0 && {
          icon: 'not-update',
        }),
      ...(!req.file && {
        icon: null,
      }),
    })

    return res.status(200).json(custom)
  }
}
