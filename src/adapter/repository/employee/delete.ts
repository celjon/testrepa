import { IEmployee } from '@/domain/entity/employee'
import { AdapterParams } from '@/adapter/types'
import { Prisma } from '@prisma/client'

type Params = Pick<AdapterParams, 'db'>

export type DeleteEmployee = (data: Prisma.EmployeeDeleteArgs) => Promise<IEmployee | never>

export const buildDeleteEmployee = ({ db }: Params): DeleteEmployee => {
  return async (data) => {
    return db.client.employee.delete(data)
  }
}
