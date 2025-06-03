import { Adapter } from '@/domain/types'

type Params = Pick<Adapter, 'modelUsageBucketRepository'>

export type IncrementUsage = (params: { modelIds: string[] }) => Promise<void>

export const buildIncrementUsage = ({ modelUsageBucketRepository,  }: Params): IncrementUsage => {
  return async ({ modelIds }) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0) // Set to the beginning of the day

    for (const modelId of modelIds) {
      await modelUsageBucketRepository.upsert({
        where: {
          model_id_bucket_date: {
            model_id: modelId,
            bucket_date: today
          }
        },
        create: {
          bucket_date: today,
          model_id: modelId,
          usage_count: 1
        },
        update: {
          usage_count: { increment: 1 }
        }
      })
    }
  }
}
