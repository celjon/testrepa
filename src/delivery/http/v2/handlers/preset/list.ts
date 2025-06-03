import { AuthRequest } from '../types'
import { Response } from 'express'
import { DeliveryParams } from '@/delivery/types'
import { toJSONString } from '@/lib'

type Params = Pick<DeliveryParams, 'preset'>

export type List = (req: AuthRequest, res: Response) => Promise<Response>

export const buildList = ({ preset }: Params): List => {
  return async (req, res) => {
    let categories: string[]
    if (Array.isArray(req.query.categories)) {
      categories = req.query.categories as string[]
    } else if (typeof req.query.categories === 'string') {
      categories = [req.query.categories]
    } else {
      categories = []
    }

    let models: string[]
    if (Array.isArray(req.query.models)) {
      models = req.query.models as string[]
    } else if (typeof req.query.models === 'string') {
      models = [req.query.models]
    } else {
      models = []
    }

    const data = await preset.list({
      userId: req.user?.id,
      search: req.query.search as string | undefined,
      ...(categories.length > 0 && {
        categories
      }),
      ...(models.length > 0 && {
        models
      }),
      favorite: req.query.favorite === '1',
      private: req.query.private === '1',
      ...(req.query.page && {
        page: +(req.query.page as string)
      }),
      ...(req.query.quantity && {
        quantity: +(req.query.quantity as string)
      }),
      locale: (req.query.locale ?? 'en').toString()
    })

    return res.status(200).header('Content-Type', 'application/json').send(toJSONString(data))
  }
}
