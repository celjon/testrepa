import { UseCaseParams } from '@/domain/usecase/types'
import { buildClusterizeExcel, ClusterizeExcel } from './clusterize-excel'

export type DataAnalysisUseCase = {
  clusterizeExcel: ClusterizeExcel
}

export const buildDataAnalysisUseCase = (params: UseCaseParams): DataAnalysisUseCase => {
  return {
    clusterizeExcel: buildClusterizeExcel(params),
  }
}
