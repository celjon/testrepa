import { AuthRequest } from '../types'
import { NextFunction, Request, Response } from 'express'
import { DeliveryParams } from '@/delivery/types'
import { getFiles, toJSONString } from '@/lib'
import { Middlewares } from '../../middlewares'

export const buildCreateMiddleware = ({ fileUpload }: Middlewares) => {
  const webFilesMiddleware = fileUpload({ saveFiles: false }).fields([
    {
      name: 'files',
      maxCount: 5,
    },
  ])

  return (req: Request, res: Response, next: NextFunction) => {
    return webFilesMiddleware(req, res, next)
  }
}

type Params = Pick<DeliveryParams, 'preset'>

export type Create = (req: AuthRequest, res: Response) => Promise<Response>

export const buildCreate = ({ preset }: Params): Create => {
  return async (req, res) => {
    const files = getFiles(req, 'files')

    const data = await preset.create({
      userId: req.user?.id,
      name: req.body.name,
      description: req.body.description,
      modelId: req.body.modelId,
      systemPrompt: req.body.systemPrompt,
      files,
      access: req.body.access,
      categoriesIds: req.body.categoriesIds || [],
    })

    return res.status(200).header('Content-Type', 'application/json').send(toJSONString(data))
  }
}
