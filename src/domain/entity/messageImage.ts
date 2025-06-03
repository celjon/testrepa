import { Field, ID, ObjectType } from 'type-graphql'
import { MessageImage, MessageImageStatus } from '@prisma/client'
import { FileGraphQLObject, IFile } from './file'
import { IMessageButton, MessageButtonGraphQLObject } from './messageButton'

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
