import { IEmployeeGroup } from '@/domain/entity/employee-group'
import { AdapterParams } from '@/adapter/types'
import { Prisma } from '@prisma/client'

type Params = Pick<AdapterParams, 'db'>

export type Delete = (data: Prisma.EmployeeGroupDeleteArgs) => Promise<IEmployeeGroup | never>

export const buildDeleteEmployeeGroup = ({ db }: Params): Delete => {
  return async (data) => {
    return db.client.employeeGroup.delete(data)
  }
}
