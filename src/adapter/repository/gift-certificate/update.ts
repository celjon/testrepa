import { AdapterParams } from '@/adapter/types'
import { Prisma } from '@prisma/client'
import { IGiftCertificate } from '@/domain/entity/gift-certificate'

type Params = Pick<AdapterParams, 'db'>

export type Update = (data: Prisma.GiftCertificateUpdateArgs) => Promise<IGiftCertificate | never>
export const buildUpdate = ({ db }: Params): Update => {
  return async (data) => {
    const giftCertificate = await db.client.giftCertificate.update(data)

    return giftCertificate
  }
}
