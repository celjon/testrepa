import { AdapterParams } from '@/adapter/types'

type Params = Pick<AdapterParams, 'db'>

export type UpdatePopularityScores = (params: { cutOffDate: Date }) => Promise<{ modelsUpdated: number }>

export const buildUpdatePopularityScores = ({ db }: Params): UpdatePopularityScores => {
  return async ({ cutOffDate }) => {
    const formattedDate = cutOffDate.toISOString()

    const modelsUpdated = await db.client.$executeRaw`
      UPDATE models
      SET 
        popularity_score = COALESCE(usage_data.total_usage, 0)
      FROM (
        SELECT 
          models.id AS model_id,
          COALESCE(SUM(model_usage_buckets.usage_count), 0) AS total_usage
        FROM models
        LEFT JOIN model_usage_buckets
          ON models.id = model_usage_buckets.model_id
          AND model_usage_buckets.bucket_date >= ${formattedDate}::TIMESTAMP
        GROUP BY 
          models.id
      ) AS usage_data
      WHERE models.id = usage_data.model_id;
    `

    return { modelsUpdated }
  }
}
