import { Prisma } from '@prisma/client'

export type Create = (params: {}) => Prisma.ChatMidjourneySettingsCreateInput

export const buildCreate = (): Create => () => {
  return {}
}
