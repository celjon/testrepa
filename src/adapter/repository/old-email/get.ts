import { AdapterParams } from '@/adapter/types'
import { Prisma } from '@prisma/client'
import { IOldEmail } from '@/domain/entity/old-email'

type Params = Pick<AdapterParams, 'db'>

export type Get = (data: Prisma.OldEmailFindFirstArgs) => Promise<IOldEmail | never | null>
export const buildGet = ({ db }: Params): Get => {
  return async (data) => {
    return (await db.client.oldEmail.findFirst(data)) as IOldEmail
  }
}
