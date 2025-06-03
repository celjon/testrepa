import { IEmployee } from '@/domain/entity/employee'
import { AdapterParams } from '@/adapter/types'
import { Prisma } from '@prisma/client'

type Params = Pick<AdapterParams, 'db'>

export type Update = (data: Prisma.EmployeeUpdateArgs) => Promise<IEmployee | never>

export const buildUpdate = ({ db }: Params): Update => {
  return async (data) => {
    return db.client.employee.update(data)
  }
}
