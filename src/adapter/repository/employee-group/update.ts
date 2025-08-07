import { IEmployeeGroup } from '@/domain/entity/employee-group'
import { AdapterParams, UnknownTx } from '@/adapter/types'
import { Prisma } from '@prisma/client'

type Params = Pick<AdapterParams, 'db'>

export type Update = (
  data: Prisma.EmployeeGroupUpdateArgs,
  tx?: UnknownTx,
) => Promise<IEmployeeGroup | never>

export const buildUpdate = ({ db }: Params): Update => {
  return async (data, tx) => {
    return db.getContextClient(tx).employeeGroup.update(data)
  }
}
