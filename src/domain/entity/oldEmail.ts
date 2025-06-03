import { OldEmail } from '@prisma/client'
import { IUser } from '@/domain/entity/user'

export interface IOldEmail extends OldEmail {
  user?: IUser
}
