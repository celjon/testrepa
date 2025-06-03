import { IPlan } from '@/domain/entity/plan'
import { Prisma } from '@prisma/client'

export type Create = (params: { plan: IPlan }) => Prisma.ChatMidjourneySettingsCreateInput

export const buildCreate = (): Create => () => {
  return {}
}
