export type CreateExcelStatsForEnterpriseParams = {
  enterpriseName: string
  agreementConclusionDate: string | null
  from?: Date
  to?: Date
  totalEnterpriseTokensCredited: bigint
  totalEnterpriseTokensSpent: bigint
  balance?: bigint
  enterpriseEmployees: {
    email: string | null
    tg_id: string | null
    usedTokens: bigint
    balance?: bigint
  }[]
}
export type CreateExcelStatsForAllEnterprisesParams = {
  params: {
    usedTokensForDates: { year: string; month: string; usedTokens: bigint }[]
    name: string
    creator: string
    agreement_conclusion_date: string | null
  }[]
}
export type CreateExcelUserSpendingStatsByDeveloperKeyParams = {
  username: string
  rows: { date: string; developerKey: string; amount: number }[]
}
export type CreateExcelInvoicingForCreditEnterprisesParams = {
  params: {
    creditedTokensForDates: { year: string; month: string; creditedTokens: bigint }[]
    name: string
    creator: string
    agreement_conclusion_date: string | null
    rubs_per_million_caps: number
  }[]
}

export type CreateExcelStatsForEnterprise = (
  params: CreateExcelStatsForEnterpriseParams,
) => Promise<Buffer<ArrayBufferLike>>
export type CreateExcelStatsForAllEnterprises = (
  params: CreateExcelStatsForAllEnterprisesParams,
) => Promise<Buffer<ArrayBufferLike>>
export type CreateExcelInvoicingForCreditEnterprises = (
  params: CreateExcelInvoicingForCreditEnterprisesParams,
) => Promise<Buffer<ArrayBufferLike>>
export type CreateExcelUserSpendingStatsByDeveloperKey = (
  params: CreateExcelUserSpendingStatsByDeveloperKeyParams,
) => Promise<Buffer<ArrayBufferLike>>
