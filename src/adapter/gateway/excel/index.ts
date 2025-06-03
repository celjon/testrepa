import {
  CreateExcelInvoicingForCreditEnterprisesParams,
  CreateExcelStatsForAllEnterprisesParams,
  CreateExcelStatsForEnterpriseParams
} from '@/adapter/gateway/excel/types'
import { buildCreateExcelStatsForEnterprise } from '@/adapter/gateway/excel/create-excel-stats-for-enterprise'
import { buildCreateExcelStatsForAllEnterprises } from '@/adapter/gateway/excel/create-excel-stats-for-all-enterprises'
import { buildCreateExcelInvoicingForCreditEnterprises } from '@/adapter/gateway/excel/create-excel-invoicing-for-credit-enterprises'
import { buildCreateProductUsageReport, CreateProductUsageReport } from './create-product-usage-report'

export type ExcelGateway = {
  createExcelStatsForEnterprise: (params: CreateExcelStatsForEnterpriseParams) => Promise<Buffer<ArrayBufferLike>>
  createExcelStatsForAllEnterprises: (params: CreateExcelStatsForAllEnterprisesParams) => Promise<Buffer<ArrayBufferLike>>
  createExcelInvoicingForCreditEnterprises: (params: CreateExcelInvoicingForCreditEnterprisesParams) => Promise<Buffer<ArrayBufferLike>>
  createProductUsageReport: CreateProductUsageReport
}

export const buildExcelGateway = (): ExcelGateway => {
  const createExcelStatsForEnterprise = buildCreateExcelStatsForEnterprise()
  const createExcelStatsForAllEnterprises = buildCreateExcelStatsForAllEnterprises()
  const createExcelInvoicingForCreditEnterprises = buildCreateExcelInvoicingForCreditEnterprises()

  return {
    createExcelStatsForEnterprise,
    createExcelStatsForAllEnterprises,
    createExcelInvoicingForCreditEnterprises,
    createProductUsageReport: buildCreateProductUsageReport()
  }
}
