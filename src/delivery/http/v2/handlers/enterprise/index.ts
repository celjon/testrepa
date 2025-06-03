import { buildListEnterprises, ListEnterprises } from './list'
import { buildDeleteEmployee, DeleteEmployee } from './deleteEmployee'
import { buildChangeEmployeeBalance, ChangeEmployeeBalance } from './changeEmployeeBalance'
import { buildGenerateInviteToken, GenerateInviteToken } from './generateInviteToken'
import { buildJoinEnterprise, JoinEnterprise } from './join'
import { buildCreateEnterprise, CreateEnterprise } from './create'
import { buildUpdateEnterprise, UpdateEnterprise } from './update'
import { buildToggleCommonPool, ToggleCommonPool } from './toggleCommonPool'
import { buildGet, GetEnterprise } from './get'
import { IHandler } from '../types'
import Express from 'express'
import { createRouteHandler } from '../../routeHandler'
import { Middlewares } from '../../middlewares'
import { buildEnterpriseRules } from './rules'
import { DeliveryParams } from '@/delivery/types'
import { buildUpdateEnterpriseLimits, UpdateEnterpriseLimits } from './updateLimits'
import { AddUsageConstraint, buildAddUsageConstraint } from './addUsageConstraint'
import { buildRemoveUsageConstraint, RemoveUsageConstraint } from './removeUsageConstraint'
import { buildListUsageConstraints, ListUsageConstraints } from './listUsageConstraints'
import { AddEmployeeModel, buildAddEmployeeModel } from './addEmployeeModel'
import { buildRemoveEmployeeModel, RemoveEmployeeModel } from './removeEmployeeModel'
import { buildGetEmployeesStatsStream, GetEmployeesStatsStream } from './get-employees-stats-stream'
import { buildGetEmployeesStatsExcel, GetEmployeesStatsExcel } from './get-employees-stats-excel'
import {
  buildGetStatsForAllEnterprisesExcel,
  GetStatsForAllEnterprisesExcel
} from '@/delivery/http/v2/handlers/enterprise/get-stats-for-all-enterprises-excel'
import {
  buildGetInvoicingForCreditEnterprisesExcel,
  GetInvoicingForCreditEnterprisesExcel
} from '@/delivery/http/v2/handlers/enterprise/get-invoicing-for-credit-enterprises-excel'

type Params = Pick<DeliveryParams, 'enterprise' | 'middlewares'>

type EnterpriseMethods = {
  list: ListEnterprises
  create: CreateEnterprise
  update: UpdateEnterprise
  updateLimits: UpdateEnterpriseLimits
  changeEmployeeBalance: ChangeEmployeeBalance
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
}

const buildRegisterRoutes = (methods: EnterpriseMethods, middlewares: Middlewares) => {
  const {
    getEnterpriseRules,
    changeEmployeeBalanceRules,
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
    getStatsForAllEnterprisesRules,
    getInvoicingForCreditedEnterprisesRules
  } = buildEnterpriseRules(middlewares)

  return (root: Express.Router) => {
    const namespace = Express.Router()
    namespace.get('/list', listEnterprisesRules, createRouteHandler(methods.list))
    namespace.get('/:id', getEnterpriseRules, createRouteHandler(methods.get))
    namespace.post('/', createEnterpriseRules, createRouteHandler(methods.create))
    namespace.put('/:id', updateEnterpriseRules, createRouteHandler(methods.update))
    namespace.put('/:id/limits', updateEnterpriseLimitsRules, createRouteHandler(methods.updateLimits))

    namespace.post('/employee/:employeeId/change-balance', changeEmployeeBalanceRules, createRouteHandler(methods.changeEmployeeBalance))
    namespace.delete('/employee/:employeeId', deleteEmployeeRules, createRouteHandler(methods.deleteEmployee))

    namespace.get('/:enterpriseId/invite-token', generateInviteTokenRules, createRouteHandler(methods.generateInviteToken))
    namespace.post('/join', joinRules, createRouteHandler(methods.join))
    namespace.post('/:id/toggle-common-pool', toggleCommonPoolRules, createRouteHandler(methods.toggleCommonPool))
    namespace.get('/:id/stats/stream', getStatsRules, createRouteHandler(methods.getEmployeesStatsStream))
    namespace.get('/:id/stats/excel', getStatsRules, createRouteHandler(methods.getEmployeesStatsExcel))
    namespace.get(
      '/stats/for-all-enterprises-excel',
      getStatsForAllEnterprisesRules,
      createRouteHandler(methods.getStatsForAllEnterprisesExcel)
    )
    namespace.get(
      '/invoicing/for-credited-enterprises-excel',
      getInvoicingForCreditedEnterprisesRules,
      createRouteHandler(methods.getInvoicingForCreditedEnterprisesExcel)
    )

    namespace.post('/:enterpriseId/usage-constraint', addUsageConstraintRules, createRouteHandler(methods.addUsageConstraint))
    namespace.delete(
      '/:enterpriseId/usage-constraint/:constraintId',
      removeUsageConstraintRules,
      createRouteHandler(methods.removeUsageConstraint)
    )
    namespace.get('/:enterpriseId/usage-constraint/list', listUsageConstraintsRules, createRouteHandler(methods.listUsageConstraints))

    namespace.post('/:enterpriseId/employee/:employeeId/model', addEmployeeModelRules, createRouteHandler(methods.addEmployeeModel))
    namespace.delete('/:enterpriseId/employee/:employeeId/model', removeEmployeeModelRules, createRouteHandler(methods.removeEmployeeModel))

    root.use('/enterprise', namespace)
  }
}

export const buildEnterpriseHandler = (params: Params): IHandler => {
  const list = buildListEnterprises(params)
  const create = buildCreateEnterprise(params)
  const update = buildUpdateEnterprise(params)
  const updateLimits = buildUpdateEnterpriseLimits(params)
  const changeEmployeeBalance = buildChangeEmployeeBalance(params)
  const deleteEmployee = buildDeleteEmployee(params)
  const generateInviteToken = buildGenerateInviteToken(params)
  const join = buildJoinEnterprise(params)
  const toggleCommonPool = buildToggleCommonPool(params)
  const get = buildGet(params)
  const addUsageConstraint = buildAddUsageConstraint(params)
  const removeUsageConstraint = buildRemoveUsageConstraint(params)
  const listUsageConstraints = buildListUsageConstraints(params)

  const addEmployeeModel = buildAddEmployeeModel(params)
  const removeEmployeeModel = buildRemoveEmployeeModel(params)

  return {
    registerRoutes: buildRegisterRoutes(
      {
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
        getEmployeesStatsStream: buildGetEmployeesStatsStream(params),
        getEmployeesStatsExcel: buildGetEmployeesStatsExcel(params),
        getStatsForAllEnterprisesExcel: buildGetStatsForAllEnterprisesExcel(params),
        getInvoicingForCreditedEnterprisesExcel: buildGetInvoicingForCreditEnterprisesExcel(params),
        addUsageConstraint,
        removeUsageConstraint,
        listUsageConstraints,
        addEmployeeModel,
        removeEmployeeModel
      },
      params.middlewares
    )
  }
}
