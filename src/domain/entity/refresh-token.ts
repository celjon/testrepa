import { Field, ID, ObjectType } from 'type-graphql'
import { RefreshToken } from '@prisma/client'
import { IUser, UserGraphQLObject } from './user'

export interface IRefreshToken extends RefreshToken {
  user?: IUser
}

@ObjectType('RefreshToken')
export class RefreshTokenGraphQLObject implements IRefreshToken {
  @Field(() => ID)
  id!: string

  @Field(() => String)
  token!: string

  @Field(() => String)
  ip!: string

  @Field(() => String, { defaultValue: null })
  user_agent!: string | null

  @Field(() => ID)
  user_id!: string

  @Field(() => UserGraphQLObject)
  user!: IUser

  @Field(() => Date)
  updated_at!: Date
}

/**
 * @openapi
 * components:
 *   entities:
 *      RefreshToken:
 *          required:
 *            - id
 *            - token
 *            - ip
 *            - updated_at
 *          properties:
 *            id:
 *              type: string
 *            token:
 *              type: string
 *            ip:
 *              type: string
 *            user_agent:
 *              type: string
 *            user_id:
 *              type: string
 *            updated_at:
 *              type: string
 *              format: date
 */
