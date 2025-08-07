import { AdapterParams } from '@/adapter/types'
import { Prisma } from '@prisma/client'
import { IEmployeeGroup } from '@/domain/entity/employee-group'

type Params = Pick<AdapterParams, 'db'>

export type Get = (
  data: Prisma.EmployeeGroupFindFirstArgs,
) => Promise<IEmployeeGroup | never | null>
export const buildGetEmployeeGroup = ({ db }: Params): Get => {
  return async (data) => {
    return (await db.client.employeeGroup.findFirst(data)) as IEmployeeGroup
  }
}
