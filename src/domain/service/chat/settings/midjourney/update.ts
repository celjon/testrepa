import { Prisma } from '@prisma/client'

export type Update = (params: {}) => Prisma.ChatMidjourneySettingsCreateInput

export const buildUpdate = (): Update => () => {
  return {}
}
