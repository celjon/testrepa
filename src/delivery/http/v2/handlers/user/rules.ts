import { body, query } from 'express-validator'
import { Middlewares } from '../../middlewares'
import { Region } from '@prisma/client'

export const buildUserRules = ({ authRequired, validateSchema }: Middlewares) => {
  const getExcelRules = [authRequired(), validateSchema]

  const getGroupsRules = [
    authRequired(),
    query('page').optional().isInt({
      min: 1,
    }),
    validateSchema,
  ]

  const sendVerifyUpdatingRules = [authRequired(), validateSchema]

  const updateUserRules = [authRequired(), validateSchema]

  const updateRegionRules = [
    authRequired(),
    body('region').isIn([Region.RU, Region.KZ, Region.GLOBAL]),
    validateSchema,
  ]

  const getPaymentMethodsRules = [authRequired(), validateSchema]

  return {
    getExcelRules,
    getGroupsRules,
    sendVerifyUpdatingRules,
    updateUserRules,
    updateRegionRules,
    getPaymentMethodsRules,
  }
}
