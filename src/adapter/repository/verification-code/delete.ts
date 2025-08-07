import { Prisma } from '@prisma/client'
import { AdapterParams } from '@/adapter/types'
import { IVerificationCode } from '@/domain/entity/verification-code'

type Params = Pick<AdapterParams, 'db'>

export type Delete = (
  params: Prisma.VerificationCodeDeleteArgs,
) => Promise<IVerificationCode | null | never>

export const buildDelete = ({ db }: Params): Delete => {
  return async (params) => {
    return db.client.verificationCode.delete(params)
  }
}
