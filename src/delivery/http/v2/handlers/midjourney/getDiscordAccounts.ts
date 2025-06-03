import { AuthRequest } from '../types'
import { Response } from 'express'
import { DeliveryParams } from '@/delivery/types'

type Params = Pick<DeliveryParams, 'midjourney'>

export type GetDiscordAccounts = (req: AuthRequest, res: Response) => Promise<Response>

export const buildGetDiscordAccounts =
  ({ midjourney }: Params): GetDiscordAccounts =>
  async (req, res) => {
    const discordAccounts = await midjourney.getDiscordAccounts()

    return res.status(200).json(discordAccounts)
  }
