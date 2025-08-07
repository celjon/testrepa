import { AdapterParams } from '@/adapter/types'
import { Prisma } from '@prisma/client'

type Params = Pick<AdapterParams, 'db'>

export type UpdateMany = (data: Prisma.EmployeeUpdateManyArgs) => Promise<{ count: number } | never>

export const buildUpdateMany = ({ db }: Params): UpdateMany => {
  return async (data) => {
    const keys = await db.client.employee.updateMany(data)

    return keys
  }
}
