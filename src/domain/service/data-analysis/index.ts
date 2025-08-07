import { Adapter } from '@/adapter'
import { buildClusterizeExcel, ClusterizeExcel } from './clusterize-excel'

export type DataAnalysisService = {
  clusterizeExcel: ClusterizeExcel
}

export const buildDataAnalysisService = (params: Adapter): DataAnalysisService => {
  return {
    clusterizeExcel: buildClusterizeExcel(params),
  }
}
