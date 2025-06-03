import { UseCaseParams } from '../types'

type Params = Pick<UseCaseParams, 'adapter'>

export type UpdatePopularityScores = () => Promise<{
  modelsUpdated: number
  bucketsDeleted: number
}>

export const buildUpdatePopularityScores = ({ adapter }: Params): UpdatePopularityScores => {
  return async () => {
    const referenceDate = new Date()

    const popularityCutOff = new Date(referenceDate)
    popularityCutOff.setDate(popularityCutOff.getDate() - 7) // 7 days
    popularityCutOff.setHours(0, 0, 0, 0)

    const deletionCutoff = new Date(referenceDate)
    deletionCutoff.setDate(deletionCutoff.getDate() - 8) // Keep an extra day
    deletionCutoff.setHours(0, 0, 0, 0)

    const { modelsUpdated } = await adapter.modelRepository.updatePopularityScores({
      cutOffDate: popularityCutOff
    })

    const { count } = await adapter.modelUsageBucketRepository.deleteMany({
      where: {
        bucket_date: { lt: deletionCutoff }
      }
    })

    return {
      modelsUpdated,
      bucketsDeleted: count
    }
  }
}
