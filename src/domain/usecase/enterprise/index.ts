import { UseCaseParams } from '@/domain/usecase/types'
import { buildList, List } from './list'
import { buildDeleteEmployee, DeleteEmployee } from './delete-employee'
import { buildChangeEmployeeBalance, ChangeEmployeeBalance } from './change-employee-balance'
import { buildGenerateInviteToken, GenerateInviteToken } from './generate-invite-token'
import { buildJoin, Join } from './join'
import { buildCreate, Create } from './create'
import { buildUpdate, Update } from './update'
import { buildToggleCommonPool, ToggleCommonPool } from './toggle-common-pool'
import { buildGet, Get } from './get'
import { AddUsageConstraint, buildAddUsageConstraint } from './add-usage-constraint'
import { buildRemoveUsageConstraint, RemoveUsageConstraint } from './remove-usage-constraint'
import { buildListUsageConstraints, ListUsageConstraints } from './list-usage-constraints'
import { AddEmployeeModel, buildAddEmployeeModel } from './add-employee-model'
import { buildRemoveEmployeeModel, RemoveEmployeeModel } from './remove-employee-model'
import { buildUpdateLimits, UpdateLimits } from './update-limits'
import { buildGetEmployeesStatsStream, GetEmployeesStatsStream } from './get-employees-stats-stream'
import { buildGetEmployeesStatsExcel, GetEmployeesStatsExcel } from './get-employees-stats-excel'
import {
  buildGetEmployeesStatsTotalTokensUsedExcel,
  GetEmployeesStatsTotalTokensUsedExcel
} from './get-employees-stats-total-tokens-used-excel'
import {
  buildGetInvoicingForCreditEnterprisesExcel,
  GetInvoicingForCreditEnterprisesExcel
} from './get-invoicing-for-credit-enterprises-excel'

export type EnterpriseUseCase = {
  list: List
  create: Create
  update: Update
  updateLimits: UpdateLimits
  changeEmployeeBalance: ChangeEmployeeBalance
  deleteEmployee: DeleteEmployee
  generateInviteToken: GenerateInviteToken
  join: Join
  toggleCommonPool: ToggleCommonPool
  get: Get
  getEmployeesStatsStream: GetEmployeesStatsStream
  addUsageConstraint: AddUsageConstraint
  removeUsageConstraint: RemoveUsageConstraint
  listUsageConstraints: ListUsageConstraints
  addEmployeeModel: AddEmployeeModel
  removeEmployeeModel: RemoveEmployeeModel
  getEmployeesStatsExcel: GetEmployeesStatsExcel
  getEmployeesStatsTotalTokensUsedExcel: GetEmployeesStatsTotalTokensUsedExcel
  getInvoicingForCreditEnterprisesExcel: GetInvoicingForCreditEnterprisesExcel
}

export const buildEnterpriseUseCase = (params: UseCaseParams): EnterpriseUseCase => {
  const list = buildList(params)
  const create = buildCreate(params)
  const update = buildUpdate(params)
  const updateLimits = buildUpdateLimits(params)
  const changeEmployeeBalance = buildChangeEmployeeBalance(params)
  const deleteEmployee = buildDeleteEmployee(params)
  const generateInviteToken = buildGenerateInviteToken(params)
  const join = buildJoin(params)
  const toggleCommonPool = buildToggleCommonPool(params)
  const get = buildGet(params)

  return {
    list,
    create,
    update,
    updateLimits,
    changeEmployeeBalance,
    deleteEmployee,
    generateInviteToken,
    join,
    toggleCommonPool,
    get,
    getInvoicingForCreditEnterprisesExcel: buildGetInvoicingForCreditEnterprisesExcel(params),
    getEmployeesStatsExcel: buildGetEmployeesStatsExcel(params),
    getEmployeesStatsTotalTokensUsedExcel: buildGetEmployeesStatsTotalTokensUsedExcel(params),
    getEmployeesStatsStream: buildGetEmployeesStatsStream(params),
    addUsageConstraint: buildAddUsageConstraint(params),
    removeUsageConstraint: buildRemoveUsageConstraint(params),
    listUsageConstraints: buildListUsageConstraints(params),
    addEmployeeModel: buildAddEmployeeModel(params),
    removeEmployeeModel: buildRemoveEmployeeModel(params)
  }
}
