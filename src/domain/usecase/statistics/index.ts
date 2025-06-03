import { UseCaseParams } from '@/domain/usecase/types'
import { buildPlatformTokens, PlatformTokens } from './platform-tokens'
import { buildGetTokensByModel, GetTokensByModel } from './get-tokens-by-model'
import { buildGetProductUsageReport, GetProductUsageReport } from './get-product-usage-report'

export type StatisticsUseCase = {
  platformTokens: PlatformTokens
  getTokensByModel: GetTokensByModel
  getProductUsageReport: GetProductUsageReport
}

export const buildStatisticsUseCase = (params: UseCaseParams): StatisticsUseCase => {
  const platformTokens = buildPlatformTokens(params)
  const getTokensByModel = buildGetTokensByModel(params)

  return {
    platformTokens,
    getTokensByModel,
    getProductUsageReport: buildGetProductUsageReport(params)
  }
}
