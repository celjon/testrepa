import { Prisma } from '@prisma/client'
import { AdapterParams, UnknownTx } from '@/adapter/types'
import { IGiftCertificate } from '@/domain/entity/gift-certificate'

type Params = Pick<AdapterParams, 'db'>

export type Delete = (
  data: Prisma.GiftCertificateDeleteArgs,
  tx?: UnknownTx,
) => Promise<IGiftCertificate | never>

export const buildDelete = ({ db }: Params): Delete => {
  return async (data, tx) => {
    const giftCertificate = await db.getContextClient(tx).giftCertificate.delete(data)

    return giftCertificate
  }
}
