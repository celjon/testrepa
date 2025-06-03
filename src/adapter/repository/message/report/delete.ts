import { Prisma, Report } from '@prisma/client'
import { AdapterParams } from '@/adapter/types'
import { DefaultArgs } from '@prisma/client/runtime/library'

type Params = Pick<AdapterParams, 'db'>

export type DeleteReport = (data: Prisma.ReportDeleteArgs<DefaultArgs>, tx?: unknown) => Promise<Report | null | undefined>

export const buildDeleteReport = ({ db }: Params): DeleteReport => {
  return async (data, tx) => {
    return db.getContextClient(tx).report.delete(data)
  }
}
