import { param } from 'express-validator'
import { Middlewares } from '../../middlewares'

export const buildRegionLockRules = ({ validateSchema }: Middlewares) => {
  const getCountryRules = [param('ip').isString(), validateSchema]

  return {
    getCountryRules
  }
}
