import { Field, ID, ObjectType } from 'type-graphql'
import { MessageSet } from '@prisma/client'
import { IChat } from './chat'
import { IMessage } from './message'

export interface IMessageSet extends MessageSet {
  chat?: IChat
  last?: IMessage
  messages?: IMessage[]
}

@ObjectType('MessageSet')
export class MessageSetGraphQLObject implements IMessageSet {
  @Field(() => ID)
  id!: string

  @Field(() => ID)
  chat_id!: string

  @Field(() => Number)
  length!: number

  @Field(() => String, { nullable: true })
  choiced!: string | null

  @Field(() => ID, { nullable: true })
  last_id!: string | null
}
