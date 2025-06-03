import { Prisma } from '@prisma/client'
import { AdapterParams } from '@/adapter/types'
import { IVerificationCode } from '@/domain/entity/verificationCode'

type Params = Pick<AdapterParams, 'db'>

export type Get = (params: Prisma.VerificationCodeFindFirstArgs) => Promise<IVerificationCode | null | never>

export const buildGet = ({ db }: Params): Get => {
  return async (params) => {
    return db.client.verificationCode.findFirst(params)
  }
}
