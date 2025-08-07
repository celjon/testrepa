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
  GetEmployeesStatsTotalTokensUsedExcel,
} from './get-employees-stats-total-tokens-used-excel'
import {
  buildGetInvoicingForCreditEnterprisesExcel,
  GetInvoicingForCreditEnterprisesExcel,
} from './get-invoicing-for-credit-enterprises-excel'
import { buildUpdateSpentInMonth, UpdateSpentInMonth } from './update-spent-in-month'
import {
  buildChangeEmployeeSpendLimit,
  ChangeEmployeeSpendLimit,
} from './change-employee-spend-limit'
import { buildUpdateEmployeeGroups, UpdateEmployeeGroups } from './update-employee-groups'
import { buildCreateEmployeeGroups, CreateEmployeeGroups } from './create-employee-groups'
import { buildDeleteEmployeeGroups, DeleteEmployeeGroups } from './delete-employee-groups'
import { buildListEmployeeGroup, ListEmployeeGroup } from './list-employee-group'

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
  updateSpentInMonth: UpdateSpentInMonth
  changeEmployeeSpendLimit: ChangeEmployeeSpendLimit
  updateEmployeeGroups: UpdateEmployeeGroups
  createEmployeeGroups: CreateEmployeeGroups
  deleteEmployeeGroups: DeleteEmployeeGroups
  listEmployeeGroup: ListEmployeeGroup
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
  const updateSpentInMonth = buildUpdateSpentInMonth(params)
  const changeEmployeeSpendLimit = buildChangeEmployeeSpendLimit(params)
  const getInvoicingForCreditEnterprisesExcel = buildGetInvoicingForCreditEnterprisesExcel(params)
  const getEmployeesStatsExcel = buildGetEmployeesStatsExcel(params)
  const getEmployeesStatsTotalTokensUsedExcel = buildGetEmployeesStatsTotalTokensUsedExcel(params)
  const getEmployeesStatsStream = buildGetEmployeesStatsStream(params)
  const addUsageConstraint = buildAddUsageConstraint(params)
  const removeUsageConstraint = buildRemoveUsageConstraint(params)
  const listUsageConstraints = buildListUsageConstraints(params)
  const addEmployeeModel = buildAddEmployeeModel(params)
  const removeEmployeeModel = buildRemoveEmployeeModel(params)
  const updateEmployeeGroups = buildUpdateEmployeeGroups(params)
  const createEmployeeGroups = buildCreateEmployeeGroups(params)
  const deleteEmployeeGroups = buildDeleteEmployeeGroups(params)
  const listEmployeeGroup = buildListEmployeeGroup(params)
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
    updateSpentInMonth,
    changeEmployeeSpendLimit,
    getInvoicingForCreditEnterprisesExcel,
    getEmployeesStatsExcel,
    getEmployeesStatsTotalTokensUsedExcel,
    getEmployeesStatsStream,
    addUsageConstraint,
    removeUsageConstraint,
    listUsageConstraints,
    addEmployeeModel,
    removeEmployeeModel,
    updateEmployeeGroups,
    createEmployeeGroups,
    deleteEmployeeGroups,
    listEmployeeGroup,
  }
}
