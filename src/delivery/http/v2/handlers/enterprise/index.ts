import { IHandler } from '../types'
import Express from 'express'
import { createRouteHandler } from '../../routeHandler'
import { Middlewares } from '../../middlewares'
import { buildEnterpriseRules } from './rules'
import { DeliveryParams } from '@/delivery/types'
import { buildGet, GetEnterprise } from './get'
import { buildListEnterprises, ListEnterprises } from './list'
import { buildDeleteEmployee, DeleteEmployee } from './delete-employee'
import { buildChangeEmployeeBalance, ChangeEmployeeBalance } from './change-employee-balance'
import { buildGenerateInviteToken, GenerateInviteToken } from './generate-invite-token'
import { buildJoinEnterprise, JoinEnterprise } from './join'
import { buildCreateEnterprise, CreateEnterprise } from './create'
import { buildUpdateEnterprise, UpdateEnterprise } from './update'
import { buildToggleCommonPool, ToggleCommonPool } from './toggle-common-pool'
import { buildUpdateEnterpriseLimits, UpdateEnterpriseLimits } from './update-limits'
import { buildAddUsageConstraint, AddUsageConstraint } from './add-usage-constraint'
import { buildRemoveUsageConstraint, RemoveUsageConstraint } from './remove-usage-constraint'
import { buildListUsageConstraints, ListUsageConstraints } from './list-usage-constraints'
import { buildAddEmployeeModel, AddEmployeeModel } from './add-employee-model'
import { buildRemoveEmployeeModel, RemoveEmployeeModel } from './remove-employee-model'
import { buildGetEmployeesStatsStream, GetEmployeesStatsStream } from './get-employees-stats-stream'
import { buildGetEmployeesStatsExcel, GetEmployeesStatsExcel } from './get-employees-stats-excel'
import {
  buildGetStatsForAllEnterprisesExcel,
  GetStatsForAllEnterprisesExcel,
} from './get-stats-for-all-enterprises-excel'
import {
  buildChangeEmployeeSpendLimit,
  ChangeEmployeeSpendLimit,
} from './change-employee-spend-limit'
import { buildUpdateEmployeeGroups, UpdateEmployeeGroups } from './update-employee-groups'
import { buildCreateEmployeeGroups, CreateEmployeeGroups } from './create-employee-groups'
import { buildDeleteEmployeeGroups, DeleteEmployeeGroups } from './delete-employee-groups'
import {
  buildGetInvoicingForCreditEnterprisesExcel,
  GetInvoicingForCreditEnterprisesExcel,
} from './get-invoicing-for-credit-enterprises-excel'
import { buildListEmployeeGroup, ListEmployeeGroup } from './list-employee-group'

type Params = Pick<DeliveryParams, 'enterprise' | 'middlewares'>

type EnterpriseMethods = {
  list: ListEnterprises
  create: CreateEnterprise
  update: UpdateEnterprise
  updateLimits: UpdateEnterpriseLimits
  changeEmployeeBalance: ChangeEmployeeBalance
  changeEmployeeSpendLimit: ChangeEmployeeSpendLimit
  deleteEmployee: DeleteEmployee
  generateInviteToken: GenerateInviteToken
  join: JoinEnterprise
  toggleCommonPool: ToggleCommonPool
  get: GetEnterprise
  getEmployeesStatsStream: GetEmployeesStatsStream
  addUsageConstraint: AddUsageConstraint
  removeUsageConstraint: RemoveUsageConstraint
  listUsageConstraints: ListUsageConstraints
  addEmployeeModel: AddEmployeeModel
  removeEmployeeModel: RemoveEmployeeModel
  getEmployeesStatsExcel: GetEmployeesStatsExcel
  getStatsForAllEnterprisesExcel: GetStatsForAllEnterprisesExcel
  getInvoicingForCreditedEnterprisesExcel: GetInvoicingForCreditEnterprisesExcel
  updateEmployeeGroups: UpdateEmployeeGroups
  createEmployeeGroups: CreateEmployeeGroups
  deleteEmployeeGroups: DeleteEmployeeGroups
  listEmployeeGroup: ListEmployeeGroup
}

const buildRegisterRoutes = (methods: EnterpriseMethods, middlewares: Middlewares) => {
  const {
    getEnterpriseRules,
    changeEmployeeBalanceRules,
    changeEmployeeSpendLimitRules,
    createEnterpriseRules,
    deleteEmployeeRules,
    generateInviteTokenRules,
    joinRules,
    listEnterprisesRules,
    toggleCommonPoolRules,
    updateEnterpriseRules,
    updateEnterpriseLimitsRules,
    getStatsRules,
    addUsageConstraintRules,
    removeUsageConstraintRules,
    listUsageConstraintsRules,
    addEmployeeModelRules,
    removeEmployeeModelRules,
    listEmployeeGroupRules,
    updateEmployeeGroupsRules,
    createEmployeeGroupsRules,
    deleteEmployeeGroupsRules,
    getStatsForAllEnterprisesRules,
    getInvoicingForCreditedEnterprisesRules,
  } = buildEnterpriseRules(middlewares)

  return (root: Express.Router) => {
    const namespace = Express.Router()
    namespace.get('/list', listEnterprisesRules, createRouteHandler(methods.list))
    namespace.get('/:id', getEnterpriseRules, createRouteHandler(methods.get))
    namespace.post('/', createEnterpriseRules, createRouteHandler(methods.create))
    namespace.put('/:id', updateEnterpriseRules, createRouteHandler(methods.update))
    namespace.put(
      '/:id/limits',
      updateEnterpriseLimitsRules,
      createRouteHandler(methods.updateLimits),
    )

    namespace.post(
      '/employee/:employeeId/change-balance',
      changeEmployeeBalanceRules,
      createRouteHandler(methods.changeEmployeeBalance),
    )
    namespace.post(
      '/employee/:employeeId/change-employee-spend-limit',
      changeEmployeeSpendLimitRules,
      createRouteHandler(methods.changeEmployeeSpendLimit),
    )
    namespace.delete(
      '/employee/:employeeId',
      deleteEmployeeRules,
      createRouteHandler(methods.deleteEmployee),
    )

    namespace.get(
      '/:enterpriseId/invite-token',
      generateInviteTokenRules,
      createRouteHandler(methods.generateInviteToken),
    )
    namespace.post('/join', joinRules, createRouteHandler(methods.join))
    namespace.post(
      '/:id/toggle-common-pool',
      toggleCommonPoolRules,
      createRouteHandler(methods.toggleCommonPool),
    )
    namespace.get(
      '/:id/stats/stream',
      getStatsRules,
      createRouteHandler(methods.getEmployeesStatsStream),
    )
    namespace.get(
      '/:id/stats/excel',
      getStatsRules,
      createRouteHandler(methods.getEmployeesStatsExcel),
    )
    namespace.get(
      '/stats/for-all-enterprises-excel',
      getStatsForAllEnterprisesRules,
      createRouteHandler(methods.getStatsForAllEnterprisesExcel),
    )
    namespace.get(
      '/invoicing/for-credited-enterprises-excel',
      getInvoicingForCreditedEnterprisesRules,
      createRouteHandler(methods.getInvoicingForCreditedEnterprisesExcel),
    )

    namespace.post(
      '/:enterpriseId/usage-constraint',
      addUsageConstraintRules,
      createRouteHandler(methods.addUsageConstraint),
    )
    namespace.delete(
      '/:enterpriseId/usage-constraint/:constraintId',
      removeUsageConstraintRules,
      createRouteHandler(methods.removeUsageConstraint),
    )
    namespace.get(
      '/:enterpriseId/usage-constraint/list',
      listUsageConstraintsRules,
      createRouteHandler(methods.listUsageConstraints),
    )

    namespace.post(
      '/:enterpriseId/employee/:employeeId/model',
      addEmployeeModelRules,
      createRouteHandler(methods.addEmployeeModel),
    )
    namespace.delete(
      '/:enterpriseId/employee/:employeeId/model',
      removeEmployeeModelRules,
      createRouteHandler(methods.removeEmployeeModel),
    )

    namespace.get(
      '/:enterpriseId/employee-group/list',
      listEmployeeGroupRules,
      createRouteHandler(methods.listEmployeeGroup),
    )

    namespace.put(
      '/:enterpriseId/employee-groups',
      updateEmployeeGroupsRules,
      createRouteHandler(methods.updateEmployeeGroups),
    )
    namespace.post(
      '/:enterpriseId/employee-groups',
      createEmployeeGroupsRules,
      createRouteHandler(methods.createEmployeeGroups),
    )
    namespace.delete(
      '/:enterpriseId/employee-groups',
      deleteEmployeeGroupsRules,
      createRouteHandler(methods.deleteEmployeeGroups),
    )

    root.use('/enterprise', namespace)
  }
}

export const buildEnterpriseHandler = (params: Params): IHandler => {
  const list = buildListEnterprises(params)
  const create = buildCreateEnterprise(params)
  const update = buildUpdateEnterprise(params)
  const updateLimits = buildUpdateEnterpriseLimits(params)
  const changeEmployeeBalance = buildChangeEmployeeBalance(params)
  const changeEmployeeSpendLimit = buildChangeEmployeeSpendLimit(params)
  const deleteEmployee = buildDeleteEmployee(params)
  const generateInviteToken = buildGenerateInviteToken(params)
  const join = buildJoinEnterprise(params)
  const toggleCommonPool = buildToggleCommonPool(params)
  const get = buildGet(params)
  const addUsageConstraint = buildAddUsageConstraint(params)
  const removeUsageConstraint = buildRemoveUsageConstraint(params)
  const listUsageConstraints = buildListUsageConstraints(params)
  const getEmployeesStatsStream = buildGetEmployeesStatsStream(params)
  const getEmployeesStatsExcel = buildGetEmployeesStatsExcel(params)
  const getStatsForAllEnterprisesExcel = buildGetStatsForAllEnterprisesExcel(params)
  const getInvoicingForCreditedEnterprisesExcel = buildGetInvoicingForCreditEnterprisesExcel(params)

  const addEmployeeModel = buildAddEmployeeModel(params)
  const removeEmployeeModel = buildRemoveEmployeeModel(params)
  const updateEmployeeGroups = buildUpdateEmployeeGroups(params)
  const createEmployeeGroups = buildCreateEmployeeGroups(params)
  const deleteEmployeeGroups = buildDeleteEmployeeGroups(params)
  const listEmployeeGroup = buildListEmployeeGroup(params)

  return {
    registerRoutes: buildRegisterRoutes(
      {
        list,
        create,
        update,
        updateLimits,
        changeEmployeeBalance,
        changeEmployeeSpendLimit,
        deleteEmployee,
        generateInviteToken,
        join,
        toggleCommonPool,
        get,
        getEmployeesStatsStream,
        getEmployeesStatsExcel,
        getStatsForAllEnterprisesExcel,
        getInvoicingForCreditedEnterprisesExcel,
        addUsageConstraint,
        removeUsageConstraint,
        listUsageConstraints,
        addEmployeeModel,
        removeEmployeeModel,
        updateEmployeeGroups,
        createEmployeeGroups,
        deleteEmployeeGroups,
        listEmployeeGroup,
      },
      params.middlewares,
    ),
  }
}
