import { buildCreateKey, CreateKey } from './create-key'
import { buildGetKeys, GetKeys } from './get-keys'
import Express from 'express'
import { IHandler } from '../types'
import { createRouteHandler } from '../../routeHandler'
import { DeliveryParams } from '@/delivery/types'
import { Middlewares } from '../../middlewares'
import { buildDeveloperRules } from './rules'
import { buildDeleteKey, DeleteKey } from './delete-key'
import { buildDeleteKeys, DeleteKeys } from './delete-keys'
import { buildUpdateKey, UpdateKey } from './update-key'

type Params = Pick<DeliveryParams, 'developer' | 'middlewares'>

export type DeveloperMethods = {
  createKey: CreateKey
  getKeys: GetKeys
  updateKey: UpdateKey
  deleteKey: DeleteKey
  deleteKeys: DeleteKeys
}

const buildRegisterRoutes = (methods: DeveloperMethods, middlewares: Middlewares) => {
  const { createKeyRules, listKeysRules, deleteKeyRules, deleteManyKeyRules, updateKeyRules } =
    buildDeveloperRules(middlewares)

  return (root: Express.Router) => {
    const namespace = Express.Router()
    namespace.post('/key/sign', createKeyRules, createRouteHandler(methods.createKey))
    namespace.get('/key/list', listKeysRules, createRouteHandler(methods.getKeys))
    namespace.patch('/key/:id', updateKeyRules, createRouteHandler(methods.updateKey))
    namespace.delete('/key/:id', deleteKeyRules, createRouteHandler(methods.deleteKey))
    namespace.delete('/key', deleteManyKeyRules, createRouteHandler(methods.deleteKeys))

    root.use('/dev', namespace)
  }
}

export const buildDeveloperHandler = (params: Params): IHandler => {
  const createKey = buildCreateKey(params)
  const getKeys = buildGetKeys(params)
  const updateKey = buildUpdateKey(params)
  const deleteKey = buildDeleteKey(params)
  const deleteKeys = buildDeleteKeys(params)

  return {
    registerRoutes: buildRegisterRoutes(
      {
        createKey,
        getKeys,
        updateKey,
        deleteKey,
        deleteKeys,
      },
      params.middlewares,
    ),
  }
}
