import { AdapterParams } from '@/adapter/types'

type Params = Pick<AdapterParams, 'dataAnalysisService'>

export type DataAnalysisGateway = {
  clusterizeExcel: AdapterParams['dataAnalysisService']['client']['clusterizeExcel']
}

export const buildDataAnalysisGateway = (params: Params) => {
  return params.dataAnalysisService.client
}
