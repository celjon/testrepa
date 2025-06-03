import { Adapter } from '@/domain/types'

type Params = Pick<Adapter, 'modelUsageBucketRepository' | 'modelRepository'>

export type UpdatePopularityScores = () => Promise<void>

export const buildUpdatePopularityScores = ({ modelUsageBucketRepository, modelRepository }: Params): UpdatePopularityScores => {
  return async () => {
    const referenceDate = new Date()

    const popularityCutOff = new Date(referenceDate)
    popularityCutOff.setDate(popularityCutOff.getDate() - 7) // 7 days
    popularityCutOff.setHours(0, 0, 0, 0)

    const deletionCutoff = new Date(referenceDate)
    deletionCutoff.setDate(deletionCutoff.getDate() - 8) // Keep an extra day
    deletionCutoff.setHours(0, 0, 0, 0)

    await modelRepository.updatePopularityScores({
      cutOffDate: popularityCutOff
    })

    await modelUsageBucketRepository.deleteMany({
      where: {
        bucket_date: { lt: deletionCutoff }
      }
    })
  }
}
