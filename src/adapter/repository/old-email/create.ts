import { AdapterParams } from '@/adapter/types'
import { Prisma } from '@prisma/client'
import { IOldEmail } from '@/domain/entity/old-email'

type Params = Pick<AdapterParams, 'db'>

export type Create = (data: Prisma.OldEmailCreateArgs) => Promise<IOldEmail>
export const buildCreate = ({ db }: Params): Create => {
  return async (data) => {
    return (await db.client.oldEmail.create(data)) as IOldEmail
  }
}
