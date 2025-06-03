import { Adapter } from '../../types'

export type Moderate = (p: { enterpriseId: string; userMessage: string }) => Promise<{ flagged: boolean }>

export type EnterpriseUsageModerationService = {
  moderate: Moderate
}
export const buildEnterpriseUsageModerationService = (params: Adapter): EnterpriseUsageModerationService => {
  return {
    moderate: async ({ enterpriseId, userMessage }) => {
      const constraints = await params.enterpriseUsageConstraintsRepository.list({
        where: {
          enterprise_id: enterpriseId
        }
      })

      if (constraints.length == 0) {
        return { flagged: false }
      }

      let prompt = 'Call this function if any of messages violates listed rules. \n User is not allowed to:'

      for (let i = 0; i < constraints.length; i++) {
        prompt += `\n${i}: ${constraints[i].constraint}`
      }

      const { tool_calls } = await params.openrouterGateway.sync({
        settings: {
          model: 'openai/gpt-3.5-turbo',
          temperature: 0,
          top_p: 1,
          system_prompt: 'You are user messages moderator'
        },
        tool_choice: 'auto',
        tools: [
          {
            type: 'function',
            function: {
              name: 'alert_enterprise_rules_violation',
              description: prompt,
              parameters: {
                type: 'object',
                properties: {
                  violated_rule: {
                    type: 'string',
                    description: 'The rule which user violates'
                  }
                },
                required: ['violated_rule']
              }
            }
          }
        ],
        messages: [
          {
            role: 'user',
            content: userMessage
          }
        ],
        endUserId: enterpriseId
      })

      if (tool_calls && tool_calls.some((el) => el.function.name === 'alert_enterprise_rules_violation')) {
        return {
          flagged: true
        }
      }

      return {
        flagged: false
      }
    }
  }
}
