import {
  ActionType,
  Currency,
  EnterprisePaymentPlanStatus,
  EnterpriseRole,
  EnterpriseType,
  FileType,
  JobStatus,
  MessageButtonAction,
  MessageButtonType,
  MessageImageStatus,
  MessageStatus,
  MidjourneyMode,
  PlanType,
  Platform,
  PresetAccess,
  Region,
  Role,
  SearchStatus,
  StrikeReason,
  TransactionProvider,
  TransactionStatus,
  TransactionType,
  EnterpriseCreator,
} from '@prisma/client'
import { GraphQLBigInt, GraphQLDateTime, GraphQLJSON } from 'graphql-scalars'
import {
  buildSchemaSync,
  MiddlewareInterface,
  NextFn,
  registerEnumType,
  ResolverData,
} from 'type-graphql'
import { Container } from 'typedi'
import { AuthResolver } from './auth'
import { ChatResolver } from './chat'
import { GroupResolver } from './group'
import { MessageResolver } from './message'
import { Resolvers } from './types'
import { GraphQLError } from 'graphql'
import {
  BaseError,
  ForbiddenError,
  InvalidDataError,
  NotFoundError,
  UnauthorizedError,
} from '@/domain/errors'
import { ModelResolver } from './model'
import { ShortcutResolver } from './shortcuts'
import { TestContext } from 'node:test'
import { PlanResolver } from './plan'

export const buildSchema = (resolvers: Resolvers) => {
  registerEnumType(Role, { name: 'Role' })
  registerEnumType(Platform, { name: 'Platform' })
  registerEnumType(EnterprisePaymentPlanStatus, { name: 'EnterprisePaymentPlanStatus' })
  registerEnumType(MessageStatus, { name: 'MessageStatus' })
  registerEnumType(ActionType, { name: 'ActionType' })
  registerEnumType(MidjourneyMode, { name: 'MidjourneyMode' })
  registerEnumType(TransactionProvider, { name: 'TransactionProvider' })
  registerEnumType(Currency, { name: 'Currency' })
  registerEnumType(TransactionStatus, { name: 'TransactionStatus' })
  registerEnumType(TransactionType, { name: 'TransactionType' })
  registerEnumType(MessageImageStatus, { name: 'MessageImageStatus' })
  registerEnumType(FileType, { name: 'FileType' })
  registerEnumType(MessageButtonType, { name: 'MessageButtonType' })
  registerEnumType(MessageButtonAction, { name: 'MessageButtonAction' })
  registerEnumType(JobStatus, { name: 'JobStatus' })
  registerEnumType(PresetAccess, { name: 'PresetAccess' })
  registerEnumType(PlanType, { name: 'PlanType' })
  registerEnumType(EnterpriseRole, { name: 'EnterpriseRole' })
  registerEnumType(EnterpriseType, { name: 'EnterpriseType' })
  registerEnumType(EnterpriseCreator, { name: 'EnterpriseCreator' })
  registerEnumType(StrikeReason, { name: 'StrikeReason' })
  registerEnumType(SearchStatus, { name: 'SearchStatus' })
  registerEnumType(Region, { name: 'Region' })

  Container.set(AuthResolver, resolvers.auth)
  Container.set(ChatResolver, resolvers.chat)
  Container.set(MessageResolver, resolvers.message)
  Container.set(GroupResolver, resolvers.group)
  Container.set(ModelResolver, resolvers.model)
  Container.set(ShortcutResolver, resolvers.shortcut)
  Container.set(PlanResolver, resolvers.plan)
  Container.set(ErrorMiddleware, new ErrorMiddleware())

  const schema = buildSchemaSync({
    resolvers: [
      AuthResolver,
      ChatResolver,
      MessageResolver,
      GroupResolver,
      ModelResolver,
      ShortcutResolver,
      PlanResolver,
    ],
    container: Container,
    scalarsMap: [
      {
        type: Date,
        scalar: GraphQLDateTime,
      },
      {
        type: Object,
        scalar: GraphQLJSON,
      },
      {
        type: BigInt,
        scalar: GraphQLBigInt,
      },
    ],
    globalMiddlewares: [ErrorMiddleware],
  })

  return schema
}

export class ErrorMiddleware implements MiddlewareInterface<TestContext> {
  async use(_: ResolverData<any>, next: NextFn) {
    try {
      return await next()
    } catch (error) {
      if (error instanceof BaseError) {
        throw new GraphQLError(error.message, {
          extensions: {
            code: error.code,
            httpStatus: getHTTPStatus(error),
            message: error.message,
            data: error.data,
          },
        })
      }

      throw error
    }
  }
}

const getHTTPStatus = (error: BaseError) => {
  if (error.httpStatus) {
    return error.httpStatus
  }

  if (error instanceof InvalidDataError) {
    return 400
  }

  if (error instanceof UnauthorizedError) {
    return 401
  }

  if (error instanceof ForbiddenError) {
    return 403
  }

  if (error instanceof NotFoundError) {
    return 404
  }

  return undefined
}
