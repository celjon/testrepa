import { Request, Response } from 'express'
import { Role } from '@prisma/client'
import { config } from '@/config'
import { getIPFromRequest } from '@/lib'
import { ForbiddenError } from '@/domain/errors'
import { DeliveryParams } from '@/delivery/types'

type Params = Pick<DeliveryParams, 'auth'>

export type Authorize = (req: Request, res: Response) => Promise<Response>

export const buildAuthorize = ({ auth }: Params): Authorize => {
  return async (req, res) => {
    const isOrgJoin = req.query.type == 'join_org'

    const ip = getIPFromRequest(req)

    const data = await auth.authorize({
      email: req.body.email?.toLowerCase(),
      password: req.body.password,
      isOrgJoin,
      ip
    })

    if (data.user.role === Role.ADMIN) {
      if (!config.admin.allowed_ips.includes(ip)) {
        throw new ForbiddenError()
      }
    }

    return res.status(200).json(data)
  }
}
