import { Field, ID, ObjectType } from 'type-graphql'
import { Shortcut } from '@prisma/client'
import { IUser, UserGraphQLObject } from './user'

/**
 * @openapi
 * components:
 *   entities:
 *     Shortcut:
 *        properties:
 *          id:
 *            type: string
 *          name:
 *            type: string
 *          text:
 *            type: string
 *          autosend:
 *            type: boolean
 *          position:
 *            type: string
 *          user_id:
 *            type: string
 *          created_at:
 *            type: string
 */
export interface IShortcut extends Shortcut {
  user: IUser
}

@ObjectType('Shortcut')
export class ShortcutGraphQLObject implements IShortcut {
  @Field(() => ID)
  id!: string

  @Field(() => String)
  name!: string

  @Field(() => String)
  text!: string

  @Field(() => Boolean)
  autosend!: boolean

  @Field(() => Number)
  position!: number

  @Field(() => ID)
  user_id!: string

  @Field(() => UserGraphQLObject)
  user!: IUser

  @Field(() => Date)
  created_at!: Date
}
