import axios, { isAxiosError } from 'axios'
import FormData from 'form-data'
import { ClusterizationResult } from './types'
import { InternalError } from '@/domain/errors'
import { RawFile } from '@/domain/entity/file'

export type DataAnalysisServiceClient = {
  clusterizeExcel: (params: { excelFile: RawFile; sheetName?: string; targetColumns: string[] }) => Promise<ClusterizationResult>
}

export const newClient = ({
  api_url
}: {
  api_url: string
}): {
  client: DataAnalysisServiceClient
} => {
  const axiosInstance = axios.create({
    baseURL: api_url
  })

  return {
    client: {
      clusterizeExcel: async ({ excelFile, sheetName, targetColumns }) => {
        try {
          const formData = new FormData()

          formData.append('excel_file', excelFile.buffer, {
            filename: excelFile.originalname,
            contentType: excelFile.mimetype
          })
          if (sheetName) {
            formData.append('sheet_name', sheetName)
          }
          for (const targetColumn of targetColumns) {
            formData.append('target_columns', targetColumn)
          }

          const response = await axiosInstance.post('/api/v1/clusterizer/clusterize', formData, {
            headers: { ...formData.getHeaders() },
            timeout: 380_000 // ms
          })

          return response.data
        } catch (e) {
          if (isAxiosError(e)) {
            throw new InternalError({
              message: e.message,
              data: {
                data: e.response?.data,
                status: e.status
              },
              code: e.code
            })
          }

          throw e
        }
      }
    }
  }
}
