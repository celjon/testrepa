import { AdapterParams } from '@/adapter/types'
import { Prisma } from '@prisma/client'
import { IEmployee } from '@/domain/entity/employee'

type Params = Pick<AdapterParams, 'db'>

export type GetEmployee = (data: Prisma.EmployeeFindFirstArgs) => Promise<IEmployee | never | null>
export const buildGetEmployee = ({ db }: Params): GetEmployee => {
  return async (data) => {
    return (await db.client.employee.findFirst(data)) as IEmployee
  }
}
