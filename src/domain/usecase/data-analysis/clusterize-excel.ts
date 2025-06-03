import { RawFile } from '@/domain/entity/file'
import { UseCaseParams } from '@/domain/usecase/types'
import { ClusterizationResult } from '@/lib/clients/data-analysis-service/types'

export type ClusterizeExcel = (params: {
  userId: string
  excelFile: RawFile
  sheetName?: string
  targetColumns: string[]
}) => Promise<ClusterizationResult>

export const buildClusterizeExcel = ({ service }: UseCaseParams): ClusterizeExcel => {
  return async ({ userId, excelFile, sheetName, targetColumns }) => {
    const result = await service.dataAnalysis.clusterizeExcel({
      userId,
      excelFile,
      sheetName,
      targetColumns
    })

    return result
  }
}
