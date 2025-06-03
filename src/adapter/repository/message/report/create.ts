import { Prisma, Report } from '@prisma/client'
import { DefaultArgs } from '@prisma/client/runtime/library'
import { AdapterParams } from '@/adapter/types'

type Params = Pick<AdapterParams, 'db'>

export type CreateReport = (data: Prisma.ReportCreateArgs<DefaultArgs>, tx?: unknown) => Promise<Report | never>

export const buildCreateReport = ({ db }: Params): CreateReport => {
  return async (data, tx) => {
    return db.getContextClient(tx).report.create(data)
  }
}
