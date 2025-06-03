import { Middlewares } from '../../middlewares'
import { config } from '@/config'

export const buildHealthCheckRules = ({ authRequired, validateSchema, allowedIps }: Middlewares) => {
  const healthCheckRules = [
    allowedIps(config.admin.allowed_ips),
    authRequired({ adminOnly: true }),
    validateSchema
  ]

  return {
    healthCheckRules
  }
}
