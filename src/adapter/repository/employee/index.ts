import { AdapterParams } from '@/adapter/types'
import { buildCount, Count } from './count'
import { buildGetEmployee, GetEmployee } from './get'
import { buildListEmployees, ListEmployees } from './list'
import { buildCreateEmployee, CreateEmployee } from './create'
import { buildDeleteEmployee, DeleteEmployee } from './delete'
import { buildUpdate, Update } from './update'
import { buildUpdateMany, UpdateMany } from './update-many'

type Params = Pick<AdapterParams, 'db'>

export type EmployeeRepository = {
  get: GetEmployee
  list: ListEmployees
  create: CreateEmployee
  delete: DeleteEmployee
  count: Count
  update: Update
  updateMany: UpdateMany
}
export const buildEmployeeRepository = (params: Params): EmployeeRepository => {
  const get = buildGetEmployee(params)
  const list = buildListEmployees(params)
  const create = buildCreateEmployee(params)
  const deleteEmployee = buildDeleteEmployee(params)
  const count = buildCount(params)
  const update = buildUpdate(params)
  const updateMany = buildUpdateMany(params)
  return {
    get,
    list,
    create,
    delete: deleteEmployee,
    count,
    update,
    updateMany,
  }
}
