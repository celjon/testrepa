import { Adapter } from '@/adapter'
import { buildPaginate, Paginate } from './paginate'

type Params = Adapter

export type SEOArticleCategoryService = {
  paginate: Paginate
}
export const buildSEOArticleCategoryService = (params: Params): SEOArticleCategoryService => {
  const paginate = buildPaginate(params)

  return {
    paginate
  }
}
