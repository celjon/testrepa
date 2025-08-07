import { Prisma, Report } from '@prisma/client'
import { AdapterParams } from '@/adapter/types'
import { DefaultArgs } from '@prisma/client/runtime/library'

type Params = Pick<AdapterParams, 'db'>

export type ListReport = (
  data: Prisma.ReportFindManyArgs<DefaultArgs>,
  tx?: unknown,
) => Promise<Report[] | null | undefined>

export const buildListReport = ({ db }: Params): ListReport => {
  return async (data, tx) => {
    return db.getContextClient(tx).report.findMany(data)
  }
}
