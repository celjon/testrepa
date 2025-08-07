import { Field, ID, ObjectType } from 'type-graphql'
import { Chat, Platform } from '@prisma/client'
import { GroupGraphQLObject, IGroup } from './group'
import { ChatSettingsGraphQLObject, IChatSettings } from './chat-settings'
import { IMessage, MessageGraphQLObject } from './message'
import { IUser, UserGraphQLObject } from './user'
import { IModel, ModelGraphQLObject } from './model'
import { IModelFunction, ModelFunctionGraphQLObject } from './model-function'

/**
 * @openapi
 * components:
 *   entities:
 *      Chat:
 *          required:
 *            - id
 *            - name
 *            - created_at
 *            - total_caps
 *          properties:
 *            id:
 *                type: string
 *            group_id:
 *                type: string
 *            user_id:
 *                type: string
 *            name:
 *                type: string
 *            total_caps:
 *                type: number
 *            highlight:
 *                type: string
 *            model_id:
 *                type: string
 *            created_at:
 *                type: string
 *                format: date
 *            queue_id:
 *                type: string
 */
export interface IChat extends Chat {
  model?: IModel
  model_function?: IModelFunction
  group?: IGroup
  settings?: IChatSettings | null
  messages?: Array<IMessage>
  user?: IUser
}

@ObjectType('Chat')
export class ChatGraphQLObject implements IChat {
  @Field(() => ID)
  id!: string

  @Field(() => String, { nullable: true })
  name!: string | null

  @Field(() => ID, { nullable: true })
  group_id!: string | null

  @Field(() => GroupGraphQLObject, { nullable: true })
  group?: GroupGraphQLObject

  @Field(() => ID, { nullable: true })
  model_id!: string | null

  @Field(() => ModelGraphQLObject, { nullable: true })
  model?: IModel

  @Field(() => ID, { nullable: true })
  model_function_id!: string | null

  @Field(() => ModelFunctionGraphQLObject, { nullable: true })
  model_function?: ModelFunctionGraphQLObject

  @Field(() => ID, { nullable: true })
  user_id!: string | null

  @Field(() => UserGraphQLObject, { nullable: true })
  user?: IUser

  @Field(() => String, { nullable: true })
  highlight!: string | null

  @Field(() => Boolean)
  initial!: boolean

  @Field(() => Platform, { nullable: true })
  platform!: Platform | null

  @Field(() => Number)
  total_caps!: number

  @Field(() => Number, { nullable: true })
  order!: number | null

  @Field(() => Boolean)
  deleted!: boolean

  @Field(() => Date)
  created_at!: Date

  @Field(() => Date, { nullable: true })
  last_message_at!: Date | null

  @Field(() => String, { nullable: true })
  queue_id!: string | null

  @Field(() => [MessageGraphQLObject], { nullable: true })
  messages?: MessageGraphQLObject[]

  @Field(() => ChatSettingsGraphQLObject, { nullable: true })
  settings?: ChatSettingsGraphQLObject | null
}

export const validChatPlatforms = [Platform.WEB, Platform.TELEGRAM]

export type ChatPlatform = (typeof validChatPlatforms)[number]
