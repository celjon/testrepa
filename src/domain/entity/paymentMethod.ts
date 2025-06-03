import { PaymentMethod } from '@prisma/client'
import { IUser } from '@/domain/entity/user'

export interface IPaymentMethod extends PaymentMethod {
  user: IUser
}
