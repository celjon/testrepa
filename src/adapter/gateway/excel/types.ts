export type CreateExcelStatsForEnterpriseParams = {
  enterpriseName: string
  agreementConclusionDate: string | null
  from?: Date
  to?: Date
  totalEnterpriseTokensCredited: bigint
  totalEnterpriseTokensSpent: bigint
  enterpriseEmployees: { email: string | null; tg_id: string | null; usedTokens: bigint }[]
}
export type CreateExcelStatsForAllEnterprisesParams = {
  params: {
    usedTokensForDates: { year: string; month: string; usedTokens: bigint }[]
    name: string
    creator: string
    agreement_conclusion_date: string | null
  }[]
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

export type CreateExcelStatsForEnterprise = (params: CreateExcelStatsForEnterpriseParams) => Promise<Buffer<ArrayBufferLike>>
export type CreateExcelStatsForAllEnterprises = (params: CreateExcelStatsForAllEnterprisesParams) => Promise<Buffer<ArrayBufferLike>>
export type CreateExcelInvoicingForCreditEnterprises = (
  params: CreateExcelInvoicingForCreditEnterprisesParams
) => Promise<Buffer<ArrayBufferLike>>
