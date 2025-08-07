import { AdapterParams } from '@/adapter/types'
import { Prisma } from '@prisma/client'

type Params = Pick<AdapterParams, 'db'>

export type Count = (params: Prisma.EmployeeGroupCountArgs) => Promise<number | never>
export const buildCount = ({ db }: Params): Count => {
  return async (args) => {
    return db.client.employeeGroup.count(args)
  }
}
