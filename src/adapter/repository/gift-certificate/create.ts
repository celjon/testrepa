import { Prisma } from '@prisma/client'
import { AdapterParams, UnknownTx } from '@/adapter/types'
import { IGiftCertificate } from '@/domain/entity/gift-certificate'

type Params = Pick<AdapterParams, 'db'>

export type Create = (
  data: Prisma.GiftCertificateCreateArgs,
  tx?: UnknownTx,
) => Promise<IGiftCertificate | never>

export const buildCreate = ({ db }: Params): Create => {
  return async (data, tx) => {
    const giftCertificate = await db.getContextClient(tx).giftCertificate.create(data)

    return giftCertificate
  }
}
