import { Field, ID, ObjectType } from 'type-graphql'
import { DeveloperKey } from '@prisma/client'
import { IUser, UserGraphQLObject } from './user'

export interface IDeveloperKey extends DeveloperKey {
  user?: IUser
}

@ObjectType('DeveloperKey')
export class DeveloperKeyGraphQLObject implements IDeveloperKey {
  @Field(() => ID)
  id!: string

  @Field(() => String)
  key!: string

  @Field(() => ID)
  user_id!: string

  @Field(() => UserGraphQLObject, { nullable: true })
  user?: IUser

  @Field(() => String)
  label!: string

  @Field(() => Boolean)
  deleted!: boolean

  @Field(() => Date)
  created_at!: Date
}
