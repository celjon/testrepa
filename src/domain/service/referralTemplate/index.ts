import { Adapter } from '../../types'
import { buildPaginate, Paginate } from './paginate'

export type ReferralTemplateService = {
  paginate: Paginate
}
export const buildReferralTemplateService = (params: Adapter): ReferralTemplateService => {
  const paginate = buildPaginate(params)
  return {
    paginate
  }
}
