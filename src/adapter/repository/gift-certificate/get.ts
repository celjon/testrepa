import { AdapterParams } from '@/adapter/types'
import { Prisma } from '@prisma/client'
import { IGiftCertificate } from '@/domain/entity/gift-certificate'

type Params = Pick<AdapterParams, 'db'>

export type Get = (
  data: Prisma.GiftCertificateFindFirstArgs,
) => Promise<IGiftCertificate | never | null>
export const buildGet = ({ db }: Params): Get => {
  return async (data) => {
    const giftCertificate = (await db.client.giftCertificate.findFirst(data)) as IGiftCertificate

    return giftCertificate
  }
}
