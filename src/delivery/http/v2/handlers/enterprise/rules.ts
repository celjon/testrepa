import { config } from '@/config'
import { check, header, param, query } from 'express-validator'
import { Middlewares } from '../../middlewares'

export const buildEnterpriseRules = ({ allowedIps, authRequired, validateSchema }: Middlewares) => {
  const listEnterprisesRules = [
    allowedIps(config.admin.allowed_ips),
    authRequired(),
    query('page').optional().isInt(),
    query('search').optional().isString(),
    validateSchema,
  ]

  const getEnterpriseRules = [authRequired(), param('id').exists().isString(), validateSchema]

  const createEnterpriseRules = [
    header('authorization').exists().notEmpty().isString(),
    authRequired({}),
    check('plan_id').optional().isString(),
    check('owner_id').optional().isString(),
    check('name').exists().isString(),
    check('type').optional().isString(),
    check('tokens').optional().isInt(),
    check('common_pool').exists().isBoolean(),
    validateSchema,
  ]

  const updateEnterpriseRules = [
    header('authorization').exists().notEmpty().isString(),
    authRequired({}),
    check('plan_id').exists().isString(),
    check('id').exists().isString(),
    check('name').exists().isString(),
    check('type').exists().isString(),
    check('tokens').exists().isInt(),
    check('common_pool').exists().isBoolean(),
    validateSchema,
  ]

  const updateEnterpriseLimitsRules = [
    header('authorization').exists().notEmpty().isString(),
    authRequired({}),
    check('id').exists().isString(),
    check('credit_limit').optional({ nullable: true }).isInt(),
    check('soft_limit').optional({ nullable: true }).isInt(),
    validateSchema,
  ]

  const changeEmployeeBalanceRules = [
    header('authorization').exists().notEmpty().isString(),
    authRequired({}),
    check('employeeId').exists().notEmpty().isString(),
    check('balanceDelta').exists().notEmpty().isInt(),
    validateSchema,
  ]

  const changeEmployeeSpendLimitRules = [
    header('authorization').exists().notEmpty().isString(),
    authRequired({}),
    check('employeeId').exists().notEmpty().isString(),
    check('spend_limit_on_month').exists().notEmpty().isInt(),
    validateSchema,
  ]

  const deleteEmployeeRules = [
    header('authorization').exists().notEmpty().isString(),
    authRequired({}),
    check('employeeId').exists().notEmpty().isString(),
    validateSchema,
  ]

  const generateInviteTokenRules = [
    header('authorization').exists().notEmpty().isString(),
    authRequired({}),
    check('enterpriseId').exists().notEmpty().isString(),
    validateSchema,
  ]

  const joinRules = [
    header('authorization').exists().notEmpty().isString(),
    authRequired({}),
    check('inviteToken').exists().notEmpty().isString(),
    validateSchema,
  ]

  const toggleCommonPoolRules = [
    header('authorization').exists().notEmpty().isString(),
    authRequired({}),
    check('id').exists().isString(),
    validateSchema,
  ]

  const getStatsRules = [
    header('authorization').exists().notEmpty().isString(),
    authRequired({}),
    check('id').exists().isString(),
    query('page').optional().isInt(),
    query('search').optional().isString(),
    query('from').optional().isISO8601(),
    query('to').optional().isISO8601(),
    validateSchema,
  ]
  const getStatsForAllEnterprisesRules = [
    header('authorization').exists().notEmpty().isString(),
    authRequired({}),
    validateSchema,
  ]
  const getInvoicingForCreditedEnterprisesRules = [
    header('authorization').exists().notEmpty().isString(),
    authRequired({}),
    validateSchema,
  ]

  const addUsageConstraintRules = [
    header('authorization').exists().notEmpty().isString(),
    authRequired({}),
    check('enterpriseId').exists().isString(),
    check('constraint').exists().isString(),
    validateSchema,
  ]

  const removeUsageConstraintRules = [
    header('authorization').exists().notEmpty().isString(),
    authRequired({}),
    check('enterpriseId').exists().isString(),
    check('constraintId').exists().isString(),
    validateSchema,
  ]

  const listUsageConstraintsRules = [
    header('authorization').exists().notEmpty().isString(),
    authRequired({}),
    check('enterpriseId').exists().isString(),
    validateSchema,
  ]

  const addEmployeeModelRules = [
    header('authorization').exists().notEmpty().isString(),
    authRequired({}),
    check('enterpriseId').exists().isString(),
    check('employeeId').exists().isString(),
    check('modelId').exists().isString(),
    validateSchema,
  ]
  const listEmployeeGroupRules = [
    header('authorization').exists().notEmpty().isString(),
    authRequired({}),
    validateSchema,
  ]
  const updateEmployeeGroupsRules = [
    header('authorization').exists().notEmpty().isString(),
    authRequired({}),
    check('groups').exists().isArray(),
    validateSchema,
  ]
  const createEmployeeGroupsRules = [
    header('authorization').exists().notEmpty().isString(),
    authRequired({}),
    check('groups').exists().isArray(),
    validateSchema,
  ]
  const deleteEmployeeGroupsRules = [
    header('authorization').exists().notEmpty().isString(),
    authRequired({}),
    check('employeeGroupIds').exists().isArray(),
    validateSchema,
  ]

  const removeEmployeeModelRules = [
    header('authorization').exists().notEmpty().isString(),
    authRequired({}),
    check('enterpriseId').exists().isString(),
    check('employeeId').exists().isString(),
    check('modelId').exists().isString(),
    validateSchema,
  ]

  return {
    listEnterprisesRules,
    createEnterpriseRules,
    getEnterpriseRules,
    updateEnterpriseRules,
    updateEnterpriseLimitsRules,
    changeEmployeeBalanceRules,
    changeEmployeeSpendLimitRules,
    deleteEmployeeRules,
    generateInviteTokenRules,
    joinRules,
    toggleCommonPoolRules,
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
  }
}
