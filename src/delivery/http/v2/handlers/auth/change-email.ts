import { DeliveryParams } from '@/delivery/types'
import { AuthRequest } from '@/delivery/http/v2/handlers/types'
import { Response } from 'express'

type Params = Pick<DeliveryParams, 'auth'>
export type ChangeEmail = (req: AuthRequest, res: Response) => Promise<Response>

export const buildChangeEmail = ({ auth }: Params): ChangeEmail => {
  return async (req, res) => {
    const user = await auth.changeEmail({
      userId: req.user?.id,
      newEmail: req.body.newEmail?.toLowerCase(),
      password: req.body.password,
    })

    return res.status(200).json(user)
  }
}
