import { EnterpriseType, Platform } from '@prisma/client'
import { config } from '@/config'
import { Adapter } from '@/domain/types'
import { LLMPlugin } from '../types'

type Params = Pick<Adapter, 'enterpriseRepository'>

export type ConstantCostPlugin = LLMPlugin

export const buildConstantCostPlugin = ({ enterpriseRepository }: Params): ConstantCostPlugin => {
  const constantCosts = config.constantCosts

  return async ({ employee, subscription, settings, sentPlatform = Platform.MAIN, platform, model }) => {
    let caps = 0

    if (platform === Platform.ENTERPRISE && employee) {
      const enterprise = await enterpriseRepository.get({
        where: { id: employee.enterprise_id }
      })

      if (enterprise?.type === EnterpriseType.CONTRACTED) {
        return {
          caps: 0,
          promptAddition: '',
          systemPromptAddition: ''
        }
      }
    }

    if (sentPlatform === Platform.MAIN && subscription.plan) {
      if (settings.text?.enable_web_search) {
        caps += constantCosts[subscription.plan.type]
      }
    }

    if (sentPlatform === Platform.DASHBOARD && subscription.plan) {
      if (model.features && model.features[0] === 'AUDIO_TO_TEXT' && subscription.plan) {
        caps += constantCosts[subscription.plan.type] * 5
      } else {
        caps += constantCosts[subscription.plan.type]
      }
    }

    return {
      caps,
      promptAddition: '',
      systemPromptAddition: ''
    }
  }
}
