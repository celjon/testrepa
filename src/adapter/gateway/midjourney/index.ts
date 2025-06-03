import { AdapterParams } from '@/adapter/types'
import { buildImagine, Imagine } from './imagine'
import { buildButton, Button } from './button'
import { AddAccount, buildAddAccount } from './addAccount'
import { buildRemoveAccount, RemoveAccount } from './removeAccount'
import { buildDescribe, Describe } from './describe'
import { buildInit, Init } from './init'
import { buildInfo, Info } from './info'

type Params = Pick<AdapterParams, 'midjourneyBalancer' | 'redis'>

export type MidjourneyGateway = {
  init: Init
  imagine: Imagine
  describe: Describe
  button: Button
  info: Info
  account: {
    add: AddAccount
    remove: RemoveAccount
  }
}

export const buildMidjourneyGateway = (params: Params): MidjourneyGateway => {
  const init = buildInit(params)
  const imagine = buildImagine()
  const describe = buildDescribe()
  const button = buildButton()
  const info = buildInfo(params)
  const addAccount = buildAddAccount(params)
  const removeAccount = buildRemoveAccount(params)

  return {
    init,
    imagine,
    describe,
    button,
    info,
    account: {
      add: addAccount,
      remove: removeAccount
    }
  }
}
