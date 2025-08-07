import { IEmployeeGroup } from '@/domain/entity/employee-group'
import { Prisma } from '@prisma/client'
import { AdapterParams } from '@/adapter/types'

type Params = Pick<AdapterParams, 'db'>

export type Create = (data: Prisma.EmployeeGroupCreateArgs) => Promise<IEmployeeGroup | never>

export const buildCreateEmployeeGroup = ({ db }: Params): Create => {
  return async (data) => {
    return (await db.client.employeeGroup.create(data)) as IEmployeeGroup
  }
}
