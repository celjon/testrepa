import { AuthRequest } from '../types'
import { AuthResolver } from './auth'
import { ChatResolver } from './chat'
import { GroupResolver } from './group'
import { MessageResolver } from './message'
import { ModelResolver } from './model'
import { PlanResolver } from './plan'
import { ShortcutResolver } from './shortcuts'

export type Resolvers = {
  auth: AuthResolver
  chat: ChatResolver
  message: MessageResolver
  group: GroupResolver
  model: ModelResolver
  shortcut: ShortcutResolver
  plan: PlanResolver
}

export type GraphQLContext = {
  req: AuthRequest
}
