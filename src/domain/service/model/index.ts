import { Adapter } from '../../types'
import { AccountBalancerService, buildAccountBalancerService } from './accountBalancer'
import { buildDisable, Disable } from './disable'
import { buildEnable, Enable } from './enable'
import { buildGetCaps, GetCaps } from './getCaps'
import { buildGetDefault, GetDefault } from './getDefault'
import { buildGetDefaultProvider, GetDefaultProvider } from './getDefaultProvider'
import { buildGetModelProviders, GetModelProviders } from './getModelProvidets'
import { buildIncrementUsage, IncrementUsage } from './increment-usage'
import { buildIsAllowed, IsAllowed } from './isAllowed'
import { buildParse, Parse } from './parse'
import { buildTokenize, Tokenize } from './tokenize'

type Params = Adapter

export type ModelService = {
  parse: Parse
  enable: Enable
  disable: Disable
  getDefault: GetDefault
  getDefaultProvider: GetDefaultProvider
  isAllowed: IsAllowed
  tokenize: Tokenize
  getCaps: GetCaps
  accountBalancer: AccountBalancerService
  getModelProviders: GetModelProviders
  incrementUsage: IncrementUsage
}

export const buildModelService = (params: Params): ModelService => {
  const parse = buildParse(params)
  const enable = buildEnable(params)
  const disable = buildDisable(params)
  const getDefault = buildGetDefault()
  const getDefaultProvider = buildGetDefaultProvider(params)
  const isAllowed = buildIsAllowed()
  const tokenize = buildTokenize()
  const getCaps = buildGetCaps({})
  const accountBalancer = buildAccountBalancerService(params)
  const getModelProviders = buildGetModelProviders(params)

  return {
    parse,
    enable,
    disable,
    getDefault,
    getDefaultProvider,
    isAllowed,
    tokenize,
    getCaps,
    accountBalancer,
    getModelProviders,
    incrementUsage: buildIncrementUsage(params)
  }
}
