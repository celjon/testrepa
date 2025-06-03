import { AdapterParams } from '@/adapter/types'
import { IUser } from '@/domain/entity/user'

type Params = Pick<AdapterParams, 'db'>

export type SetDisable = (userId: string, disable: boolean) => Promise<IUser | null | never>
export const buildSetDisable = ({ db }: Params): SetDisable => {
  return async (userId: string, disable: boolean) => {
    const user = (await db.client.user.update({
      where: { id: userId },
      data: { disabled: disable }
    })) as IUser | null

    return user
  }
}
