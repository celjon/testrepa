import { IEmployee } from '@/domain/entity/employee'
import { Prisma } from '@prisma/client'
import { AdapterParams } from '@/adapter/types'

type Params = Pick<AdapterParams, 'db'>

export type CreateEmployee = (data: Prisma.EmployeeCreateArgs) => Promise<IEmployee | never>

export const buildCreateEmployee = ({ db }: Params): CreateEmployee => {
  return async (data) => {
    return (await db.client.employee.create(data)) as IEmployee
  }
}
