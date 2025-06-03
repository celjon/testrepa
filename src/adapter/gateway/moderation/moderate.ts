import { AdapterParams } from '@/adapter/types'
import { OpenAiModerateResponseDto } from '@/domain/dto'

type Params = Pick<AdapterParams, 'openaiModerationBalancer'>

export type Moderate = (input: string) => Promise<OpenAiModerateResponseDto>

export const buildModerate = ({ openaiModerationBalancer }: Params): Moderate => {
  return async (input) => {
    const { client } = openaiModerationBalancer.next()

    const { results } = await client.moderations.create({
      model: 'omni-moderation-latest',
      input
    })

    const flagged = results[0].flagged || Object.values(results[0].category_scores).some((el) => el >= 0.08)

    return {
      categories: results[0].categories,
      flagged
    }
  }
}
