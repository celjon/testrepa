import Express from 'express'
import { createYoga } from 'graphql-yoga'
import { costLimitPlugin } from '@escape.tech/graphql-armor-cost-limit'
import { maxDepthPlugin } from '@escape.tech/graphql-armor-max-depth'
import { DeliveryParams } from '@/delivery/types'
import { Middlewares } from '../../middlewares'
import { IHandler } from '../types'
import { Resolvers } from './types'
import { buildSchema } from './buildSchema'
import { AuthResolver } from './auth'
import { ChatResolver } from './chat'
import { MessageResolver } from './message'
import { GroupResolver } from './group'
import { ModelResolver } from './model'
import { ShortcutResolver } from './shortcuts'
import { PlanResolver } from './plan'

type Params = Pick<DeliveryParams, 'auth' | 'group' | 'chat' | 'message' | 'model' | 'shortcut' | 'plan' | 'middlewares'>

const buildRegisterRoutes = (resolvers: Resolvers, middlewares: Middlewares) => {
  const schema = buildSchema(resolvers)

  const yoga = createYoga({
    schema: schema,
    graphiql: false,
    maskedErrors: false,
    plugins: [
      costLimitPlugin({
        maxCost: 25000,
        objectCost: 2,
        scalarCost: 1,
        depthCostFactor: 1.5,
        ignoreIntrospection: true
      }),
      maxDepthPlugin({
        n: 12
      })
    ]
  })

  return (root: Express.Router) => {
    const namespace = Express.Router()

    namespace.all('/', middlewares.authRequired({}), yoga)

    root.use('/graphql', namespace)
  }
}

export const buildGraphQLHandler = (params: Params): IHandler => {
  const auth = new AuthResolver(params)
  const chat = new ChatResolver(params)
  const message = new MessageResolver(params)
  const group = new GroupResolver(params)
  const model = new ModelResolver(params)
  const shortcut = new ShortcutResolver(params)
  const plan = new PlanResolver(params)

  return {
    registerRoutes: buildRegisterRoutes(
      {
        auth,
        chat,
        message,
        group,
        model,
        shortcut,
        plan
      },
      params.middlewares
    )
  }
}
