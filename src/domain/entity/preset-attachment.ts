import { Field, ID, ObjectType } from 'type-graphql'
import { PresetAttachment } from '@prisma/client'
import { IPreset, PresetGraphQLObject } from './preset'
import { FileGraphQLObject, IFile } from './file'

/**
 * @openapi
 * components:
 *   entities:
 *      PresetAttachment:
 *          required:
 *            - id
 *            - preset_id
 *            - is_nsfw
 *            - file_id
 *            - created_at
 *          properties:
 *            id:
 *                type: string
 *            preset_id:
 *                type: string
 *            is_nsfw:
 *                type: boolean
 *            file_id:
 *                type: string
 *            created_at:
 *                type: string
 *                format: date
 */
export interface IPresetAttachment extends PresetAttachment {
  presets?: IPreset[]
  file?: IFile
}

@ObjectType('PresetAttachment')
export class PresetAttachmentGraphQLObject implements IPresetAttachment {
  @Field(() => ID)
  id!: string

  @Field(() => String)
  preset_id!: string

  @Field(() => Boolean)
  is_nsfw!: boolean

  @Field(() => String)
  file_id!: string

  @Field(() => FileGraphQLObject)
  file?: IFile

  @Field(() => Date)
  created_at!: Date

  @Field(() => [PresetGraphQLObject])
  presets?: PresetGraphQLObject[]
}
