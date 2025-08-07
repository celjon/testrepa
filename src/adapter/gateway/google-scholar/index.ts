import { AdapterParams } from '@/adapter/types'
import {
  buildGetGoogleScholarResultsWithPDF,
  GetGoogleScholarResultsWithPDF,
} from '@/adapter/gateway/google-scholar/get-google-scholar-result'

export type GoogleScholarGateway = {
  getGoogleScholarResultsWithPDF: GetGoogleScholarResultsWithPDF
}
export const buildGoogleScholarGateway = (params: AdapterParams) => {
  const getGoogleScholarResultsWithPDF = buildGetGoogleScholarResultsWithPDF(params)
  return { getGoogleScholarResultsWithPDF }
}
