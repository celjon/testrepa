import { Field, ID, ObjectType } from 'type-graphql'
import { Report } from '@prisma/client'
import { ChatGraphQLObject } from './chat'
import { MessageGraphQLObject } from './message'

/**
 * @openapi
 * components:
 *   entities:
 *     Report:
 *       properties:
 *         id:
 *           type: string
 *         user_id:
 *           type: string
 *         description:
 *           type: string
 *         chat_id:
 *           type: string
 *         chat:
 *           $ref: '#/components/entities/Chat'
 *         createdAt:
 *           type: string
 *           format: date-time
 *         message_id:
 *           type: string
 *         message:
 *           $ref: '#/components/entities/Message'
 */

export interface IReport extends Report {
  chat: ChatGraphQLObject
  message: MessageGraphQLObject
}

@ObjectType('Report')
export class ReportGraphQLObject implements IReport {
  @Field(() => ID)
  id!: string

  @Field(() => String)
  user_id!: string

  @Field(() => String, { nullable: true })
  description!: string

  @Field(() => String)
  chat_id!: string

  @Field(() => ChatGraphQLObject)
  chat!: ChatGraphQLObject

  @Field(() => Date)
  createdAt!: Date

  @Field(() => String)
  message_id!: string

  @Field(() => MessageGraphQLObject)
  message!: MessageGraphQLObject
}
