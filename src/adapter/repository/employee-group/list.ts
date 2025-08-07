import { AdapterParams } from '@/adapter/types'
import { Prisma } from '@prisma/client'
import { IEmployeeGroup } from '@/domain/entity/employee-group'

type Params = Pick<AdapterParams, 'db'>

export type List = (
  data?: Prisma.EmployeeGroupFindManyArgs,
) => Promise<Array<IEmployeeGroup> | never>

export const buildListEmployeeGroups = ({ db }: Params): List => {
  return async (data) => {
    return db.client.employeeGroup.findMany(data)
  }
}
