import { AdapterParams } from '@/adapter/types'
import { Prisma } from '@prisma/client'
import { IEmployee } from '@/domain/entity/employee'

type Params = Pick<AdapterParams, 'db'>

export type ListEmployees = (
  data?: Prisma.EmployeeFindManyArgs,
) => Promise<Array<IEmployee> | never>

export const buildListEmployees = ({ db }: Params): ListEmployees => {
  return async (data) => {
    return db.client.employee.findMany(data)
  }
}
