import { createUnionType, Field, ID, ObjectType } from 'type-graphql'
import {
  ChatImageSettings,
  ChatMidjourneySettings,
  ChatReplicateImageSettings,
  ChatSettings,
  ChatSpeechSettings,
  ChatSTTSettings,
  ChatTextSettings,
  ChatVideoSettings,
  MidjourneyMode
} from '@prisma/client'
import { IChat } from './chat'
import { IModel, ModelGraphQLObject } from './model'
import { IPreset, PresetGraphQLObject } from './preset'
import { FileGraphQLObject, IFile } from './file'

export interface IChatTextSettings extends ChatTextSettings {
  preset?: IPreset | null
  files?: IFile[]
}

export interface IChatImageSettings extends ChatImageSettings {}

export interface IChatMidjourneySettings extends ChatMidjourneySettings {}

export interface IChatReplicateImageSettings extends ChatReplicateImageSettings {}

export interface IChatVideoSettings extends ChatVideoSettings {}

export type ChatSpeechSettingsModel = 'tts-1' | 'tts-1-hd'
export type ChatSpeechSettingsVoice = 'fable' | 'alloy' | 'onyx' | 'nova' | 'shimmer' | 'echo'
export type ChatSpeechSettingsResponseFormat = 'mp3' | 'opus' | 'aac' | 'flac' | 'wav' | 'pcm'

export interface IChatSpeechSettings extends ChatSpeechSettings {
  model: ChatSpeechSettingsModel
  voice: ChatSpeechSettingsVoice
  response_format: ChatSpeechSettingsResponseFormat
}

export interface IChatSTTSettings extends ChatSTTSettings {
  model: string
  temperature: number
}

export interface IChatSettings extends ChatSettings {
  text?: IChatTextSettings | null
  image?: IChatImageSettings | null
  mj?: IChatMidjourneySettings | null
  replicateImage?: IChatReplicateImageSettings | null
  speech?: IChatSpeechSettings | null
  chat?: IChat
  elements?: IChatSettingsElement[]
  stt?: IChatSTTSettings | null
  video?: IChatVideoSettings | null
}

export interface IChatSettingsTextElement {
  type: 'string'
  field_type: 'text'
  value: string
}

export interface IChatSettingsTextAreaElement {
  type: 'string'
  field_type: 'textarea'
  value: string
}

export interface IChatSettingsRangeElement {
  type: 'float'
  field_type: 'range'
  step: number
  max: number
  min: number
  value: number
}

export interface IChatSettingsCheckboxElement {
  type: 'boolean'
  field_type: 'checkbox'
  checked: boolean
}

export interface IChatSettingsSelectDataItem {
  id: string
  code: string
  value: string
  label?: string
  disabled?: boolean
}

export interface IChatSettingsSelectElement {
  type: 'string'
  field_type: 'select'
  value: string
  data: IChatSettingsSelectDataItem[]
}

export enum ChatSettingsCustomType {
  MODEL_SELECT = 'MODEL_SELECT',
  PRESET_SELECT = 'PRESET_SELECT',
  FILES = 'FILES'
}

export interface IChatSettingsModelSelectElement {
  type: 'string'
  custom_type: ChatSettingsCustomType.MODEL_SELECT
  value: string
  data: IModel[]
}

export interface IChatSettingsPresetSelectElement {
  type: 'string'
  custom_type: ChatSettingsCustomType.PRESET_SELECT
  value: string | null
  data: IChatSettingsPresetSelectElementData
}

export interface IChatSettingsPresetSelectElementData {
  preset: IPreset | null
}

export interface IChatSettingsFilesElement {
  type: 'array'
  custom_type: ChatSettingsCustomType.FILES
  value: IFile[]
}

export type IChatSettingsCustomElement = {
  field_type: 'custom'
} & (IChatSettingsModelSelectElement | IChatSettingsPresetSelectElement | IChatSettingsFilesElement)

export interface IChatSettingsElementBase {
  id: string
  code: string
  name: string // name of field in database
  reload_on_update?: boolean
}

export type IChatSettingsElement = IChatSettingsElementBase &
  (
    | IChatSettingsTextElement
    | IChatSettingsTextAreaElement
    | IChatSettingsRangeElement
    | IChatSettingsCheckboxElement
    | IChatSettingsSelectElement
    | IChatSettingsCustomElement
  )

// GraphQL type definitions
@ObjectType('ChatSettingsElementBase')
class ChatSettingsElementBaseGraphQLObject implements IChatSettingsElementBase {
  @Field(() => ID)
  id!: string

  @Field(() => String)
  code!: string

  @Field(() => String)
  name!: string

  @Field(() => Boolean, { nullable: true })
  reload_on_update?: boolean
}

@ObjectType('ChatSettingsTextElement')
export class ChatSettingsTextElementGraphQLObject extends ChatSettingsElementBaseGraphQLObject implements IChatSettingsTextElement {
  @Field(() => String)
  type!: 'string'

  @Field(() => String)
  field_type!: 'text'

  @Field(() => String)
  value!: string
}

@ObjectType('ChatSettingsTextAreaElement')
export class ChatSettingsTextAreaElementGraphQLObject extends ChatSettingsElementBaseGraphQLObject implements IChatSettingsTextAreaElement {
  @Field(() => String)
  type!: 'string'

  @Field(() => String)
  field_type!: 'textarea'

  @Field(() => String)
  value!: string
}

@ObjectType('ChatSettingsRangeElement')
export class ChatSettingsRangeElementGraphQLObject extends ChatSettingsElementBaseGraphQLObject implements IChatSettingsRangeElement {
  @Field(() => String)
  type!: 'float'

  @Field(() => String)
  field_type!: 'range'

  @Field(() => Number)
  step!: number

  @Field(() => Number)
  max!: number

  @Field(() => Number)
  min!: number

  @Field(() => Number)
  value!: number
}

@ObjectType('ChatSettingsCheckboxElement')
export class ChatSettingsCheckboxElementGraphQLObject extends ChatSettingsElementBaseGraphQLObject implements IChatSettingsCheckboxElement {
  @Field(() => String)
  type!: 'boolean'

  @Field(() => String)
  field_type!: 'checkbox'

  @Field(() => Boolean)
  checked!: boolean
}

@ObjectType('ChatSettingsSelectDataItem')
export class ChatSettingsSelectDataItemGraphQLObject implements IChatSettingsSelectDataItem {
  @Field(() => ID)
  id!: string

  @Field(() => String)
  code!: string

  @Field(() => String)
  value!: string

  @Field(() => String, { nullable: true })
  label?: string

  @Field(() => Boolean, { nullable: true })
  disabled?: boolean
}

@ObjectType('ChatSettingsSelectElement')
export class ChatSettingsSelectElementGraphQLObject extends ChatSettingsElementBaseGraphQLObject implements IChatSettingsSelectElement {
  @Field(() => String)
  type!: 'string'

  @Field(() => String)
  field_type!: 'select'

  @Field(() => String)
  value!: string

  @Field(() => [ChatSettingsSelectDataItemGraphQLObject])
  data!: ChatSettingsSelectDataItemGraphQLObject[]
}

@ObjectType('ChatSettingsModelSelectElement')
export class ChatSettingsModelSelectElementGraphQLObject
  extends ChatSettingsElementBaseGraphQLObject
  implements IChatSettingsModelSelectElement
{
  @Field(() => String)
  type!: 'string'

  @Field(() => String)
  field_type!: 'custom'

  @Field(() => String)
  custom_type!: ChatSettingsCustomType.MODEL_SELECT

  @Field(() => String)
  value!: string

  @Field(() => [ModelGraphQLObject])
  data!: ModelGraphQLObject[]
}

@ObjectType('ChatSettingsPresetSelectElementData')
class ChatSettingsPresetSelectElementDataGraphQLObject implements IChatSettingsPresetSelectElementData {
  @Field(() => PresetGraphQLObject, { nullable: true })
  preset!: PresetGraphQLObject | null
}

@ObjectType('ChatSettingsPresetSelectElement')
export class ChatSettingsPresetSelectElementGraphQLObject
  extends ChatSettingsElementBaseGraphQLObject
  implements IChatSettingsPresetSelectElement
{
  @Field(() => String)
  type!: 'string'

  @Field(() => String)
  field_type!: 'custom'

  @Field(() => String)
  custom_type!: ChatSettingsCustomType.PRESET_SELECT

  @Field(() => String, { nullable: true })
  value!: string | null

  @Field(() => ChatSettingsPresetSelectElementDataGraphQLObject)
  data!: ChatSettingsPresetSelectElementDataGraphQLObject
}

@ObjectType('ChatSettingsFilesElement')
export class ChatSettingsFilesElementGraphQLObject extends ChatSettingsElementBaseGraphQLObject implements IChatSettingsFilesElement {
  @Field(() => String)
  type!: 'array'

  @Field(() => String)
  field_type!: 'custom'

  @Field(() => String)
  custom_type!: ChatSettingsCustomType.FILES

  @Field(() => [FileGraphQLObject])
  value!: FileGraphQLObject[]
}

type _ChatSettingsElementGraphQLObject =
  | ChatSettingsTextElementGraphQLObject
  | ChatSettingsTextAreaElementGraphQLObject
  | ChatSettingsRangeElementGraphQLObject
  | ChatSettingsCheckboxElementGraphQLObject
  | ChatSettingsSelectElementGraphQLObject
  | ChatSettingsModelSelectElementGraphQLObject
  | ChatSettingsPresetSelectElementGraphQLObject
  | ChatSettingsFilesElementGraphQLObject

const ChatSettingsElementGraphQLObject = createUnionType({
  name: 'ChatSettingsElement',
  types: () =>
    [
      ChatSettingsTextElementGraphQLObject,
      ChatSettingsTextAreaElementGraphQLObject,
      ChatSettingsRangeElementGraphQLObject,
      ChatSettingsCheckboxElementGraphQLObject,
      ChatSettingsSelectElementGraphQLObject,
      ChatSettingsModelSelectElementGraphQLObject,
      ChatSettingsPresetSelectElementGraphQLObject,
      ChatSettingsFilesElementGraphQLObject
    ] as const
})

@ObjectType('ChatSettings')
export class ChatSettingsGraphQLObject implements IChatSettings {
  @Field(() => ID)
  id!: string

  @Field(() => ID, { nullable: true })
  chat_id!: string | null

  @Field(() => ID, { nullable: true })
  text_id!: string | null

  @Field(() => ChatTextSettingsGraphQLObject, { nullable: true })
  text?: IChatTextSettings | null

  @Field(() => ID, { nullable: true })
  image_id!: string | null

  @Field(() => ChatImageSettingsGraphQLObject, { nullable: true })
  image?: IChatImageSettings | null

  @Field(() => ID, { nullable: true })
  mj_id!: string | null

  @Field(() => ChatMidjourneySettingsGraphQLObject, { nullable: true })
  mj?: IChatMidjourneySettings | null

  @Field(() => ID, { nullable: true })
  stt_id!: string | null

  @Field(() => ChatSTTSettingsGraphQLObject, { nullable: true })
  stt?: IChatSTTSettings | null

  @Field(() => ID, { nullable: true })
  video_id!: string | null

  @Field(() => ChatVideoSettingsGraphQLObject, { nullable: true })
  video?: IChatVideoSettings | null

  @Field(() => ID, { nullable: true })
  replicateImage_id!: string | null

  @Field(() => ChatReplicateImageSettingsGraphQLObject, { nullable: true })
  replicateImage?: IChatReplicateImageSettings | null

  @Field(() => ID, { nullable: true })
  speech_id!: string | null

  @Field(() => ChatSpeechSettingsGraphQLObject, { nullable: true })
  speech?: IChatSpeechSettings | null

  @Field(() => Date)
  created_at!: Date

  @Field(() => [ChatSettingsElementGraphQLObject], { nullable: true })
  elements?: IChatSettingsElement[]
}

@ObjectType('ChatTextSettings')
export class ChatTextSettingsGraphQLObject implements IChatTextSettings {
  @Field(() => ID)
  id!: string

  @Field(() => String)
  model!: string

  @Field(() => String)
  system_prompt!: string

  @Field(() => String, { nullable: true })
  full_system_prompt!: string | null

  @Field(() => Number)
  system_prompt_tokens!: number

  @Field(() => [FileGraphQLObject], { nullable: true })
  files?: FileGraphQLObject[]

  @Field(() => Date)
  created_at!: Date

  @Field(() => Number)
  temperature!: number

  @Field(() => Number)
  top_p!: number

  @Field(() => Number)
  presence_penalty!: number

  @Field(() => Number)
  frequency_penalty!: number

  @Field(() => Number)
  max_tokens!: number

  @Field(() => Boolean)
  include_context!: boolean

  @Field(() => PresetGraphQLObject, { nullable: true })
  preset?: PresetGraphQLObject | null

  @Field(() => Boolean)
  analyze_urls!: boolean

  @Field(() => Boolean)
  enable_web_search!: boolean

  @Field(() => String, { nullable: true })
  preset_id!: string | null
}

@ObjectType('ChatImageSettings')
export class ChatImageSettingsGraphQLObject implements IChatImageSettings {
  @Field(() => ID)
  id!: string

  @Field(() => String)
  model!: string

  @Field(() => String)
  size!: string

  @Field(() => String)
  quality!: string

  @Field(() => String, { nullable: true })
  style!: string | null

  @Field(() => Date)
  created_at!: Date
}

@ObjectType('ChatMidjourneySettings')
export class ChatMidjourneySettingsGraphQLObject implements IChatMidjourneySettings {
  @Field(() => ID)
  id!: string

  @Field(() => String)
  aspect!: string

  @Field(() => String)
  chaos!: number

  @Field(() => String)
  no!: string

  @Field(() => Number)
  quality!: number

  @Field(() => Number)
  stop!: number

  @Field(() => String, { nullable: true })
  style!: string | null

  @Field(() => Number)
  stylize!: number

  @Field(() => Boolean)
  tile!: boolean

  @Field(() => Number)
  weird!: number

  @Field(() => MidjourneyMode)
  mode!: MidjourneyMode

  @Field(() => String)
  version!: string

  @Field(() => Date)
  created_at!: Date
}

@ObjectType('ChatReplicateImageSettings')
export class ChatReplicateImageSettingsGraphQLObject implements IChatReplicateImageSettings {
  @Field(() => ID)
  id!: string

  @Field(() => String)
  model!: string

  @Field(() => Number)
  prompt_strength!: number

  @Field(() => String)
  aspect_ratio!: string

  @Field(() => Number)
  steps!: number

  @Field(() => Number)
  guidance!: number

  @Field(() => Number)
  interval!: number

  @Field(() => Number)
  seed!: number

  @Field(() => String)
  output_format!: string

  @Field(() => Number)
  output_quality!: number

  @Field(() => Number)
  num_outputs!: number

  @Field(() => String)
  negative_prompt!: string

  @Field(() => Date)
  created_at!: Date
}

@ObjectType('ChatSpeechSettings')
export class ChatSpeechSettingsGraphQLObject implements IChatSpeechSettings {
  @Field(() => ID)
  id!: string

  @Field(() => String)
  model!: ChatSpeechSettingsModel

  @Field(() => String)
  voice!: ChatSpeechSettingsVoice

  @Field(() => String)
  response_format!: ChatSpeechSettingsResponseFormat

  @Field(() => Number)
  speed!: number

  @Field(() => Date)
  created_at!: Date
}

@ObjectType('ChatSTTSettings')
export class ChatSTTSettingsGraphQLObject implements IChatSTTSettings {
  @Field(() => ID)
  id!: string

  @Field(() => String)
  model!: 'whisper-1'

  @Field(() => Number)
  temperature!: number

  @Field(() => Boolean)
  format!: boolean

  @Field(() => Boolean)
  speakers!: boolean

  @Field(() => Date)
  created_at!: Date
}
@ObjectType('ChatVideoSettings')
export class ChatVideoSettingsGraphQLObject implements IChatVideoSettings {
  @Field(() => ID)
  id!: string

  @Field(() => String)
  aspect_ratio!: string

  @Field(() => Number)
  duration_seconds!: number

  @Field(() => Number)
  seed!: number 

  @Field(() => String)
  model!: string

  @Field(() => Date)
  created_at!: Date
}
