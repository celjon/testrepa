import { body, check, query } from 'express-validator'
import { Platform } from '@prisma/client'
import { config } from '@/config'
import { validProducts } from '@/domain/entity/statistics'
import { Middlewares } from '../../middlewares'

export const buildAdminRules = ({ allowedIps, authRequired, validateSchema }: Middlewares) => {
  const listUsersRules = [
    allowedIps(config.admin.allowed_ips),
    authRequired({ adminOnly: true }),
    query('page').optional().isNumeric(),
    query('search').optional().isString(),
    validateSchema,
  ]

  const updateUserRules = [
    allowedIps(config.admin.allowed_ips),
    authRequired({ adminOnly: true }),
    check('plan_id').exists().isString(),
    check('tokens').exists().isNumeric(),
    validateSchema,
  ]

  const transactionListRules = [allowedIps(config.admin.allowed_ips), authRequired()]

  const planModelRules = [
    allowedIps(config.admin.allowed_ips),
    authRequired({}),
    check('modelId').exists().isString(),
    validateSchema,
  ]

  const updatePlanRules = [
    allowedIps(config.admin.allowed_ips),
    authRequired(),
    check('price').optional().isInt(),
    check('tokens').optional().isInt(),
    check('defaultModelId').optional().isInt(),
    validateSchema,
  ]

  const createReferralTemplateRules = [
    allowedIps(config.admin.allowed_ips),
    authRequired(),
    check('name').exists().isString().not().isEmpty(),
    check('locale').exists().isString(),
    check('currency').exists().isString().not().isEmpty(),
    check('planId').optional().isString(),
    check('tokens').optional().isNumeric(),
    check('minWithdrawAmount').exists().isNumeric(),
    check('encouragementPercentage').exists().isNumeric(),
    validateSchema,
  ]

  const deleteReferralTemplateRules = [allowedIps(config.admin.allowed_ips), authRequired()]

  const platformTokensRules = [
    allowedIps(config.admin.allowed_ips),
    authRequired({ adminOnly: true }),
    query('dateFrom').isISO8601().toDate().withMessage('Invalid date received'),
    query('dateTo').isISO8601().toDate().withMessage('Invalid date received'),
    validateSchema,
  ]

  const getTokensByModelRules = [
    allowedIps(config.admin.allowed_ips),
    authRequired({ adminOnly: true }),
    query('dateFrom').isISO8601().toDate().withMessage('Invalid date received'),
    query('dateTo').isISO8601().toDate().withMessage('Invalid date received'),
    validateSchema,
  ]

  const getProductUsageReportRules = [
    allowedIps(config.admin.allowed_ips),
    authRequired({ adminOnly: true }),
    query('dateFrom').isISO8601().toDate().withMessage('Invalid date received'),
    query('dateTo').isISO8601().toDate().withMessage('Invalid date received'),
    query('product').isString().isIn(validProducts),
    validateSchema,
  ]

  const listReferralTemplateRules = [
    allowedIps(config.admin.allowed_ips),
    authRequired(),
    query('page').optional().isNumeric(),
    query('search').optional().isString(),
    query('locale').optional().isString(),
    validateSchema,
  ]

  const updateModelRules = [allowedIps(config.admin.allowed_ips), authRequired({}), validateSchema]

  const modelEnableDisableRules = [
    allowedIps(config.admin.allowed_ips),
    authRequired({}),
    body('modelId').notEmpty().isString(),
    check('platform').optional().isIn([Platform.API, Platform.WEB, Platform.TELEGRAM]),
    validateSchema,
  ]

  const modelSetDefaultRules = [
    allowedIps(config.admin.allowed_ips),
    authRequired({}),
    body('modelId').notEmpty().isString(),
    validateSchema,
  ]

  const unsetDefaultModelRules = [
    allowedIps(config.admin.allowed_ips),
    authRequired({}),
    body('modelId').notEmpty().isString(),
    validateSchema,
  ]

  return {
    updateUserRules,
    transactionListRules,
    listUsersRules,
    planModelRules,
    createReferralTemplateRules,
    deleteReferralTemplateRules,
    listReferralTemplateRules,
    updatePlanRules,
    updateModelRules,
    platformTokensRules,
    getTokensByModelRules,
    getProductUsageReportRules,
    modelEnableDisableRules,
    modelSetDefaultRules,
    unsetDefaultModelRules,
  }
}
