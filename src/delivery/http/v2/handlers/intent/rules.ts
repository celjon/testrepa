import { check } from 'express-validator'
import { Middlewares } from '../../middlewares'

export const buildDetermineRules = ({ validateSchema }: Middlewares) => {
  return [check('message').optional().isString(), validateSchema]
}
