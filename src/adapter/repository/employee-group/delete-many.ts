import { AdapterParams } from '@/adapter/types'
import { Prisma } from '@prisma/client'

type Params = Pick<AdapterParams, 'db'>

export type DeleteMany = (
  data: Prisma.EmployeeGroupDeleteManyArgs,
) => Promise<{ count: number } | null | never>

export const buildDeleteManyEmployeeGroup = ({ db }: Params): DeleteMany => {
  return async (data) => {
    return db.client.employeeGroup.deleteMany(data)
  }
}
