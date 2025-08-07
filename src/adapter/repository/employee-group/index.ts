import { AdapterParams } from '@/adapter/types'
import { buildCount, Count } from './count'
import { buildGetEmployeeGroup, Get } from './get'
import { buildListEmployeeGroups, List } from './list'
import { buildCreateEmployeeGroup, Create } from './create'
import { buildDeleteEmployeeGroup, Delete } from './delete'
import { buildUpdate, Update } from './update'
import {
  buildDeleteManyEmployeeGroup,
  DeleteMany,
} from '@/adapter/repository/employee-group/delete-many'

type Params = Pick<AdapterParams, 'db'>

export type EmployeeGroupRepository = {
  get: Get
  list: List
  create: Create
  delete: Delete
  deleteMany: DeleteMany
  count: Count
  update: Update
}
export const buildEmployeeGroupRepository = (params: Params): EmployeeGroupRepository => {
  const get = buildGetEmployeeGroup(params)
  const list = buildListEmployeeGroups(params)
  const create = buildCreateEmployeeGroup(params)
  const deleteEmployeeGroup = buildDeleteEmployeeGroup(params)
  const deleteMany = buildDeleteManyEmployeeGroup(params)
  const count = buildCount(params)
  const update = buildUpdate(params)
  return {
    get,
    list,
    create,
    delete: deleteEmployeeGroup,
    deleteMany,
    count,
    update,
  }
}
