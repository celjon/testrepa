import { AdapterParams } from '@/adapter/types'
import { buildInTx, inTx } from './inTx'

type Params = Pick<AdapterParams, 'db'>

export type Transactor = {
  inTx: inTx
}
export const buildTransactor = (params: Params): Transactor => {
  const inTx = buildInTx(params)
  return {
    inTx
  }
}
