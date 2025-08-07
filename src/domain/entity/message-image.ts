import { Field, ID, ObjectType } from 'type-graphql'
import { MessageImage, MessageImageStatus } from '@prisma/client'
import { FileGraphQLObject, IFile } from './file'
import { IMessageButton, MessageButtonGraphQLObject } from './message-button'

export interface IMessageImage extends MessageImage {
  original?: IFile
  preview?: IFile
  buttons?: IMessageButton[]
}

@ObjectType('MessageImage')
export class MessageImageGraphQLObject implements IMessageImage {
  @Field(() => ID)
  id!: string

  @Field(() => ID, { nullable: true })
  message_id!: string | null

  @Field(() => Number)
  width!: number

  @Field(() => Number)
  height!: number

  @Field(() => Number)
  preview_height!: number

  @Field(() => Number)
  preview_width!: number

  @Field(() => ID, { nullable: true })
  preview_id!: string | null

  @Field(() => FileGraphQLObject, { nullable: true })
  preview?: FileGraphQLObject

  @Field(() => ID, { nullable: true })
  original_id!: string | null

  @Field(() => FileGraphQLObject, { nullable: true })
  original?: FileGraphQLObject

  @Field(() => Boolean, { nullable: true })
  is_nsfw!: boolean | null

  @Field(() => Date)
  created_at!: Date

  @Field(() => MessageImageStatus)
  status!: MessageImageStatus

  @Field(() => [MessageButtonGraphQLObject], { nullable: true })
  buttons?: IMessageButton[]
}
/**
 * @openapi
 * components:
 *   entities:
 *     MessageImage:
 *       required:
 *         - id
 *         - message_id
 *         - width
 *         - height
 *         - preview_height
 *         - preview_width
 *         - preview_id
 *         - original_id
 *         - is_nsfw
 *         - created_at
 *         - status
 *       properties:
 *         id:
 *           type: string
 *         message_id:
 *           type: string
 *         width:
 *           type: number
 *         height:
 *           type: number
 *         preview_height:
 *           type: number
 *         preview_width:
 *           type: number
 *         preview_id:
 *           type: string
 *         original_id:
 *           type: string
 *         is_nsfw:
 *           type: boolean
 *         created_at:
 *           type: string
 *           format: date
 *         status:
 *           type: string
 *           enum: [PENDING, DONE]
 */
