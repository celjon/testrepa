import { Field, ID, ObjectType } from 'type-graphql'
import { ActionType, Attachment, Message, MessageStatus, MidjourneyMode, Platform, SearchStatus } from '@prisma/client'
import { IChat } from '@/domain/entity/chat'
import { ITransaction, TransactionGraphQLObject } from './transaction'
import { FileGraphQLObject, IFile } from './file'
import { IModel, ModelGraphQLObject } from './model'
import { IJob, JobGraphQLObject } from './job'
import { IMessageImage, MessageImageGraphQLObject } from './messageImage'
import { IMessageButton, MessageButtonGraphQLObject } from './messageButton'
import { IMessageSet, MessageSetGraphQLObject } from './messageSet'
import { IVoice, VoiceGraphQLObject } from './voice'
import { IUser } from './user'
import { IVideo, VideoGraphQLObject } from '@/domain/entity/video'

export interface IMessage extends Omit<Message, 'search_results'> {
  chat?: IChat
  transaction?: ITransaction
  model?: IModel
  job?: IJob
  images?: IMessageImage[]
  buttons?: IMessageButton[]
  all_buttons?: IMessageButton[]
  attachments?: Array<IAttachment>
  set?: IMessageSet
  voice?: IVoice
  video?: IVideo
  user?: IUser
  next_version?: IMessage
  previous_version?: IMessage
  search_results?: ISearchResult[] | null
}

export interface ISearchResult {
  url: string
  title: string
  snippet: string

  [key: string]: string
}

export interface IAttachment extends Attachment {
  message: IMessage
  file: IFile
}

@ObjectType('Message')
export class MessageGraphQLObject implements IMessage {
  @Field(() => ID)
  id!: string

  @Field(() => String)
  role!: string

  @Field(() => MessageStatus)
  status!: MessageStatus

  @Field(() => Boolean)
  choiced!: boolean

  @Field(() => Number)
  version!: number

  @Field(() => Date)
  created_at!: Date

  @Field(() => ID, { nullable: true })
  set_id!: string | null

  @Field(() => MessageSetGraphQLObject, { nullable: true })
  set?: IMessageSet

  @Field(() => ID, { nullable: true })
  previous_version_id!: string | null

  @Field(() => ID, { nullable: true })
  next_version_id!: string | null

  @Field(() => String, { nullable: true })
  model_id!: string | null

  @Field(() => ModelGraphQLObject, { nullable: true })
  model?: IModel

  @Field(() => String, { nullable: true })
  model_version!: string | null

  @Field(() => String, { nullable: true })
  content!: string | null

  @Field(() => String, { nullable: true })
  full_content!: string | null

  @Field(() => String, { nullable: true })
  reasoning_content!: string | null

  @Field(() => Number, { nullable: true })
  reasoning_time_ms!: number | null

  @Field(() => SearchStatus, { nullable: true })
  search_status!: SearchStatus | null

  @Field(() => Object, { nullable: true })
  search_results?: any | null

  @Field(() => Boolean)
  isEncrypted!: boolean

  @Field(() => Object, { nullable: true })
  additional_content!: any

  @Field(() => ID)
  chat_id!: string

  @Field(() => ID, { nullable: true })
  user_id!: string | null

  @Field(() => Number)
  tokens!: number

  @Field(() => Boolean)
  disabled!: boolean

  @Field(() => ActionType, { nullable: true })
  action_type!: ActionType | null

  @Field(() => ID, { nullable: true })
  request_id!: string | null

  @Field(() => ID, { nullable: true })
  job_id!: string | null

  @Field(() => JobGraphQLObject, { nullable: true })
  job?: IJob

  @Field(() => ID, { nullable: true })
  transaction_id!: string | null

  @Field(() => TransactionGraphQLObject, { nullable: true })
  transaction?: ITransaction

  @Field(() => [MessageImageGraphQLObject], { nullable: true })
  images?: IMessageImage[]

  @Field(() => [MessageButtonGraphQLObject], { nullable: true })
  buttons?: IMessageButton[]

  @Field(() => [MessageButtonGraphQLObject], { nullable: true })
  all_buttons?: IMessageButton[]

  @Field(() => [AttachmentGraphQLObject], { nullable: true })
  attachments?: IAttachment[]

  @Field(() => ID, { nullable: true })
  voice_id!: string | null

  @Field(() => VoiceGraphQLObject, { nullable: true })
  voice?: IVoice

  @Field(() => ID, { nullable: true })
  video_id!: string | null

  @Field(() => VideoGraphQLObject, { nullable: true })
  video?: IVideo

  @Field(() => MidjourneyMode, { nullable: true })
  mj_mode!: MidjourneyMode | null

  @Field(() => Platform, { nullable: true })
  platform!: Platform | null
}

@ObjectType('Attachment')
export class AttachmentGraphQLObject implements IAttachment {
  @Field(() => ID)
  id!: string

  @Field(() => ID)
  message_id!: string

  @Field(() => MessageGraphQLObject)
  message!: MessageGraphQLObject

  @Field(() => String)
  file_id!: string

  @Field(() => FileGraphQLObject)
  file!: FileGraphQLObject

  @Field(() => Date)
  created_at!: Date
}

/**
 * @openapi
 * components:
 *   entities:
 *      Message:
 *          required:
 *            - id
 *            - name
 *            - created_at
 *            - type
 *          properties:
 *            id:
 *                type: string
 *            role:
 *                type: string
 *                enum: [assistant, user, action]
 *            type:
 *                type: string
 *                enum: [TEXT, IMAGE, ACTION]
 *            status:
 *                type: string
 *                enum: [PENDING, DONE]
 *            tokens:
 *                type: number
 *            action_type:
 *                type: string
 *                enum: [CONTEXT_CLEARED]
 *            user_id:
 *                type: string
 *            chat_id:
 *                type: string
 *            additional_content:
 *                type: string
 *            tg_bot_message_id:
 *                type: string
 *            disabled:
 *                type: boolean
 *            content:
 *                type: string
 *            request_id:
 *                type: string
 *            transaction_id:
 *                type: string
 *            model_id:
 *                type: string
 *            created_at:
 *                type: string
 *                format: date
 */
