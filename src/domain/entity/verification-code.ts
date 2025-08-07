import { VerificationCode } from '@prisma/client'
import { IUser } from './user'

export interface IVerificationCode extends VerificationCode {
  user?: IUser
}
