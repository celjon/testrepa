import { Field, ID, ObjectType } from 'type-graphql'
import { Preset, PresetAccess } from '@prisma/client'
import { IModel, ModelGraphQLObject } from './model'
import { IUser, UserGraphQLObject } from './user'
import { IPresetCategory, PresetCategoryGraphQLObject } from './presetCategory'
import { IPresetAttachment, PresetAttachmentGraphQLObject } from './presetAttachment'

/**
 * @openapi
 * components:
 *   entities:
 *      Preset:
 *          required:
 *            - id
 *            - name
 *            - description
 *            - created_at
 *          properties:
 *            id:
 *                type: string
 *            name:
 *                type: string
 *            description:
 *                type: string
 *            model_id:
 *                type: string
 *            system_prompt:
 *                type: string
 *            access:
 *                type: string
 *                enum: [PUBLIC, PRIVATE]
 *            usage_count:
 *                type: number
 *            author_id:
 *                type: string
 *            created_at:
 *                type: string
 *                format: date
 */
export interface IPreset extends Preset {
  favorite?: boolean
  model?: IModel | null
  attachments?: IPresetAttachment[]
  categories?: IPresetCategory[]
  users?: IUser[]
}

@ObjectType('Preset')
export class PresetGraphQLObject implements IPreset {
  @Field(() => ID)
  id!: string

  @Field(() => String)
  name!: string

  @Field(() => String)
  description!: string

  @Field(() => ID, { nullable: true })
  model_id!: string | null

  @Field(() => ModelGraphQLObject, { nullable: true })
  model?: IModel | null

  @Field(() => String)
  system_prompt!: string

  @Field(() => [PresetAttachmentGraphQLObject], { nullable: true })
  attachments?: PresetAttachmentGraphQLObject[]

  @Field(() => PresetAccess)
  access!: PresetAccess

  @Field(() => BigInt)
  usage_count!: bigint

  @Field(() => ID)
  author_id!: string

  @Field(() => [PresetCategoryGraphQLObject], { nullable: true })
  categories?: PresetCategoryGraphQLObject[]

  @Field(() => [UserGraphQLObject], { nullable: true })
  users?: UserGraphQLObject[]

  @Field(() => Boolean, { nullable: true })
  favorite?: boolean

  @Field(() => Date)
  created_at!: Date
}
