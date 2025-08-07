import {
  CreateExcelInvoicingForCreditEnterprisesParams,
  CreateExcelStatsForAllEnterprisesParams,
  CreateExcelStatsForEnterpriseParams,
  CreateExcelUserSpendingStatsByDeveloperKeyParams,
} from './types'
import { buildCreateExcelStatsForEnterprise } from './create-excel-stats-for-enterprise'
import { buildCreateExcelStatsForAllEnterprises } from './create-excel-stats-for-all-enterprises'
import { buildCreateExcelInvoicingForCreditEnterprises } from './create-excel-invoicing-for-credit-enterprises'
import {
  buildCreateProductUsageReport,
  CreateProductUsageReport,
} from './create-product-usage-report'
import { buildCreateExcelUserSpendingStatsByDeveloperKey } from './create-excel-user-spending-stats-by-developer-key'
import {
  buildCreateG4FExtendedProductUsageReport,
  CreateG4FExtendedProductUsageReport,
} from './create-g4f-extended-product-usage-report'
import {
  buildCreateG4FProductUsageReport,
  CreateG4FProductUsageReport,
} from './create-g4f-product-usage-report.1'

export type ExcelGateway = {
  createExcelStatsForEnterprise: (
    params: CreateExcelStatsForEnterpriseParams,
  ) => Promise<Buffer<ArrayBufferLike>>
  createExcelStatsForAllEnterprises: (
    params: CreateExcelStatsForAllEnterprisesParams,
  ) => Promise<Buffer<ArrayBufferLike>>
  createExcelInvoicingForCreditEnterprises: (
    params: CreateExcelInvoicingForCreditEnterprisesParams,
  ) => Promise<Buffer<ArrayBufferLike>>
  createExcelUserSpendingStatsByDeveloperKey: (
    params: CreateExcelUserSpendingStatsByDeveloperKeyParams,
  ) => Promise<Buffer<ArrayBufferLike>>
  createProductUsageReport: CreateProductUsageReport
  createG4FProductUsageReport: CreateG4FProductUsageReport
  createG4FExtendedProductUsageReport: CreateG4FExtendedProductUsageReport
}

export const buildExcelGateway = (): ExcelGateway => {
  return {
    createExcelStatsForEnterprise: buildCreateExcelStatsForEnterprise(),
    createExcelStatsForAllEnterprises: buildCreateExcelStatsForAllEnterprises(),
    createExcelInvoicingForCreditEnterprises: buildCreateExcelInvoicingForCreditEnterprises(),
    createExcelUserSpendingStatsByDeveloperKey: buildCreateExcelUserSpendingStatsByDeveloperKey(),
    createProductUsageReport: buildCreateProductUsageReport(),
    createG4FProductUsageReport: buildCreateG4FProductUsageReport(),
    createG4FExtendedProductUsageReport: buildCreateG4FExtendedProductUsageReport(),
  }
}
