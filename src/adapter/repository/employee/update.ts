import { IEmployee } from '@/domain/entity/employee'
import { AdapterParams, UnknownTx } from '@/adapter/types'
import { Prisma } from '@prisma/client'

type Params = Pick<AdapterParams, 'db'>

export type Update = (data: Prisma.EmployeeUpdateArgs, tx?: UnknownTx) => Promise<IEmployee | never>

export const buildUpdate = ({ db }: Params): Update => {
  return async (data, tx) => {
    return db.getContextClient(tx).employee.update(data)
  }
}
