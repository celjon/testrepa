import { Prisma } from '@prisma/client'
import { IVerificationCode } from '@/domain/entity/verification-code'
import { AdapterParams } from '@/adapter/types'

type Params = Pick<AdapterParams, 'db'>

export type Create = (
  params: Prisma.VerificationCodeCreateArgs,
) => Promise<IVerificationCode | never>

export const buildCreate = ({ db }: Params): Create => {
  return async (params) => {
    return db.client.verificationCode.create(params)
  }
}
