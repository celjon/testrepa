import { Field, ID, ObjectType } from 'type-graphql'
import { Group } from '@prisma/client'
import { IUser, UserGraphQLObject } from './user'
import { ChatGraphQLObject, IChat } from './chat'

export interface IGroup extends Group {
  user?: IUser
  chats?: Array<IChat>
}

@ObjectType('Group')
export class GroupGraphQLObject implements IGroup {
  @Field(() => ID)
  id!: string

  @Field(() => ID)
  user_id!: string

  @Field(() => UserGraphQLObject, { nullable: true })
  user?: IUser

  @Field(() => String, { nullable: true })
  name!: string | null

  @Field(() => Date)
  created_at!: Date

  @Field(() => String, { nullable: true })
  highlight!: string | null

  @Field(() => Number, { nullable: true })
  order!: number | null

  @Field(() => [ChatGraphQLObject], { nullable: true })
  chats?: ChatGraphQLObject[]
}

/**
 * @openapi
 * components:
 *   entities:
 *      Group:
 *          required:
 *            - id
 *            - name
 *            - user_id
 *            - created_at
 *          properties:
 *            id:
 *                type: string
 *            preset_id:
 *                type: string
 *            user_id:
 *                type: string
 *            name:
 *                type: string
 *            highlight:
 *                type: string
 *            created_at:
 *                type: string
 *                format: date
 */
