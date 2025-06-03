import { AdapterParams, UnknownTx } from '@/adapter/types'

type Params = Pick<AdapterParams, 'db'>

export type inTx = <T>(
  fn: (tx: UnknownTx) => Promise<T>,
  options?: {
    timeout?: number
  }
) => Promise<T>

export const buildInTx = ({ db }: Params): inTx => {
  return async (fn, options = {}) => {
    const data = await db.client.$transaction(fn, options)

    return data
  }
}
