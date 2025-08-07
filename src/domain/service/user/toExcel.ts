import { Adapter } from '../../types'

export type ToExcel = () => Promise<Buffer | never>

export const buildToExcel = ({ userRepository }: Adapter): ToExcel => {
  return async () => {
    const users = await userRepository.list({
      include: {
        subscription: {
          include: {
            plan: true,
          },
        },
      },
      orderBy: {
        created_at: 'desc',
      },
    })

    const buf = await userRepository.toExcel(users)
    return buf
  }
}
