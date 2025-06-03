import { AdapterParams } from '@/adapter/types'
import { Prisma } from '@prisma/client'

type Params = Pick<AdapterParams, 'db'>

export type Count = (params: Prisma.EmployeeCountArgs) => Promise<number | never>
export const buildCount = ({ db }: Params): Count => {
  return async (args) => {
    return db.client.employee.count(args)
  }
}
