import { Middlewares } from '../../middlewares'

export const buildPlanRules = ({ authRequired, validateSchema }: Middlewares) => {
  const buyPlanRules = [authRequired(), validateSchema]

  const cancelPlanRules = [authRequired(), validateSchema]

  return {
    buyPlanRules,
    cancelPlanRules,
  }
}
