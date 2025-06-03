import { DeliveryParams } from '@/delivery/types'
import { IJob } from '../../types'
import { buildParse, Parse } from './parse'
import cron from 'node-cron'
import { BalanceAccount, buildBalanceAccount } from './balanceAccount'
import { buildInit, Init } from './init'

type Params = Pick<DeliveryParams, 'model'>

type ModelMethods = {
  init: Init
  parse: Parse
  balanceAccount: BalanceAccount
}

const buildStart = (methods: ModelMethods) => {
  return () => {
    methods.init()
    methods.parse()
    methods.balanceAccount()

    cron.schedule('0 * * * *', () => methods.parse())
    cron.schedule('*/5 * * * *', () => methods.balanceAccount())
  }
}

export const buildModelJob = (params: Params): IJob => {
  const init = buildInit(params)
  const parse = buildParse(params)
  const balanceAccount = buildBalanceAccount(params)

  return {
    start: buildStart({
      init,
      parse,
      balanceAccount
    })
  }
}
