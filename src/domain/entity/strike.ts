import { Strike, StrikeReason } from '@prisma/client'
import { Field, ID, ObjectType } from 'type-graphql'
import { IMessage, MessageGraphQLObject } from './message'
import { IUser, UserGraphQLObject } from './user'

export interface IStrike extends Strike {
  user: IUser
  message?: IMessage
}

@ObjectType('Strike')
export class StrikeGraphQLObject implements IStrike {
  @Field(() => ID)
  id!: string

  @Field(() => ID)
  user_id!: string

  @Field(() => UserGraphQLObject)
  user!: IUser

  @Field(() => ID)
  message_id!: string

  @Field(() => MessageGraphQLObject)
  message!: IMessage

  @Field(() => String)
  content!: string

  @Field(() => StrikeReason)
  reason!: StrikeReason

  @Field(() => Boolean)
  corrected!: boolean

  @Field(() => Date)
  created_at!: Date
}
