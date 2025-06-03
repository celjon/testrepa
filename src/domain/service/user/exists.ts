import { Adapter } from '../../types'

export type Exists = (user: { id?: string; email?: string }) => Promise<boolean>

export const buildExists = ({ userRepository }: Adapter): Exists => {
  return async (us) => {
    const user = await userRepository.get({
      where: {
        ...us
      }
    })

    return !!user
  }
}
