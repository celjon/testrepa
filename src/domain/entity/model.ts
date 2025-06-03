import { Field, ID, ObjectType } from 'type-graphql'
import { Model, PlanType, Platform } from '@prisma/client'
import { IPlan, PlanGraphQLObject } from './plan'
import { IModelFunction, ModelFunctionGraphQLObject } from './modelFunction'
import { EmployeeGraphQLObject, IEmployee } from './employee'
import { IModelProvider } from './modelProvider'
import { FileGraphQLObject, IFile } from './file'

/**
 * @openapi
 * components:
 *   entities:
 *      Model:
 *          required:
 *            - id
 *            - owned_by
 *            - created_at
 *            - order
 *            - used_count
 *            - popularity_score
 *          properties:
 *            id:
 *                type: string
 *            label:
 *                  oneOf:
 *                    - type: null
 *                    - type: string
 *            owned_by:
 *                type: string
 *            order:
 *                type: number
 *            used_count:
 *                type: number
 *            popularity_score:
 *                type: number
 *            created_at:
 *                type: string
 *                format: date
 */
export interface IModel extends Omit<Model, 'features'> {
  default_model_plans?: Array<IPlan>
  parent?: IModel | null
  is_allowed?: boolean
  allowed_plan_type?: PlanType | null
  features?: ModelFeature[]
  functions?: IModelFunction[]
  is_default?: boolean
  plans?: Array<IPlan>
  employees?: Array<IEmployee>
  children?: IModel[]
  provider?: IModelProvider | null
  child_provider?: IModelProvider | null
  providers?: IModelProvider[]
  icon?: IFile | null
}

export type ModelFeature =
  | 'TEXT_TO_TEXT'
  | 'DOCUMENT_TO_TEXT'
  | 'TEXT_TO_IMAGE'
  | 'TEXT_TO_IMAGE_LLM'
  | 'IMAGE_TO_TEXT'
  | 'TEXT_TO_AUDIO'
  | 'AUDIO_TO_TEXT'
  | 'CHAIN_OF_THOUGHT'
  | 'EMBEDDING'
  | 'TEXT_TO_VIDEO'
  | 'IMAGE_TO_VIDEO'

@ObjectType('Model')
export class ModelGraphQLObject implements IModel {
  @Field(() => ID)
  id!: string

  @Field(() => String, { nullable: true })
  label!: string | null

  @Field(() => String, { nullable: true })
  description!: string | null

  @Field(() => ID, { nullable: true })
  icon_id!: string | null

  @Field(() => FileGraphQLObject, { nullable: true })
  icon?: IFile | null

  @Field(() => String, { nullable: true })
  pricing!: any | null

  @Field(() => Boolean)
  auto_update_pricing!: boolean

  @Field(() => String)
  prefix!: string

  @Field(() => Number)
  context_length!: number

  @Field(() => Number)
  max_tokens!: number

  @Field(() => [String], { nullable: true })
  features?: ModelFeature[]

  @Field(() => [ModelFunctionGraphQLObject], { nullable: true })
  functions?: IModelFunction[]

  @Field(() => Boolean, { nullable: true })
  is_default?: boolean

  @Field(() => [PlanGraphQLObject], { nullable: true })
  plans?: IPlan[]

  @Field(() => [EmployeeGraphQLObject], { nullable: true })
  employees?: EmployeeGraphQLObject[]

  @Field(() => [ModelGraphQLObject], { nullable: true })
  children?: IModel[]

  @Field(() => ID, { nullable: true })
  provider_id!: string | null

  @Field(() => ID, { nullable: true })
  child_provider_id!: string | null

  @Field(() => Number)
  order!: number

  @Field(() => Boolean)
  custom!: boolean

  @Field(() => String)
  owned_by!: string

  @Field(() => ID, { nullable: true })
  parent_id!: string | null

  @Field(() => ModelGraphQLObject, { nullable: true })
  parent?: IModel | null

  @Field(() => String, { nullable: true })
  message_color!: string | null

  @Field(() => Boolean)
  disabled!: boolean

  @Field(() => Boolean)
  disabledWeb!: boolean

  @Field(() => Boolean)
  disabledTelegram!: boolean

  @Field(() => Number)
  used_count!: number

  @Field(() => Number)
  popularity_score!: number

  @Field(() => Date)
  created_at!: Date

  @Field(() => Boolean, { nullable: true })
  is_allowed?: boolean | undefined

  @Field(() => PlanType, { nullable: true })
  allowed_plan_type?: PlanType | undefined | null

  @Field(() => Date, { nullable: true })
  deleted_at!: Date | null
}

export const validModelPlatforms = [Platform.API, Platform.WEB, Platform.TELEGRAM]

export type ModelPlatform = (typeof validModelPlatforms)[number]

export const getPlatformDisabledKey = (platform: ModelPlatform) => {
  switch (platform) {
    case Platform.WEB:
      return 'disabledWeb'
    case Platform.TELEGRAM:
      return 'disabledTelegram'
    default:
      return 'disabled'
  }
}

export const isTextModel = (model: IModel) => !!model.features && model.features.some((modelFeature) => modelFeature === 'TEXT_TO_TEXT')

export const isImageModel = (model: IModel) => !!model.features && model.features.some((modelFeature) => modelFeature === 'TEXT_TO_IMAGE')

export const isImageLLMModel = (model: IModel) =>
  !!model.features &&
  model.features.some((modelFeature) => modelFeature === 'TEXT_TO_IMAGE') &&
  model.features.some((modelFeature) => modelFeature === 'TEXT_TO_IMAGE_LLM')

export const isAudioModel = (model: IModel) => !!model.features && model.features.some((modelFeature) => modelFeature === 'AUDIO_TO_TEXT')

export const isSpeechModel = (model: IModel) => !!model.features && model.features.some((modelFeature) => modelFeature === 'TEXT_TO_AUDIO')

export const isClaude = (model: IModel | string) => !!(typeof model === 'string' ? model : model.id).match(/^claude/)

export const isMidjourney = (model: { id: string }) => !!model.id.match(/^midjourney/)

export const isStableDiffusion = (model: { id: string }) => !!model.id.match(/^stable-diffusion/) || isStableDiffusion3(model)

export const isVeo = (model: {  id: string  }) => !!model.id.match(/^veo/)

export const isStableDiffusion3 = (model: { id: string }) => !!model.id.match(/^stable-diffusion-3/)

export const isFlux = (model: { id: string }) =>
  !!model.id.match(/^flux/) ||
  !!model.id.match(/^replicate-flux/) ||
  isFluxPro(model) ||
  isFluxDev(model) ||
  isFluxSchnell(model) ||
  isFlux11Pro(model)

export const isFluxPro = (model: { id: string }) => !!model.id.match(/^flux-pro$/)

export const isFluxDev = (model: { id: string }) => !!model.id.match(/^flux-dev$/)

export const isFluxSchnell = (model: { id: string }) => !!model.id.match(/^flux-schnell$/)

export const isFlux11Pro = (model: { id: string }) => !!model.id.match(/^flux-1.1-pro$/)

export const isReplicateImageModel = (model: { id: string; provider_id: string | null; features?: string[] }) =>
  isFlux(model) || isStableDiffusion(model)

export const isVideoModel = (model: IModel) =>
  model.features && model.features.some((modelFeature) => modelFeature === 'IMAGE_TO_VIDEO' || modelFeature === 'TEXT_TO_VIDEO')

export const isReplicateVideoModel = (model: { id: string; provider_id: string | null; features?: string[] }) => isVeo(model)

export const isO1 = (model: { id: string }) => !!model.id.match(/^o1(.*)/)

export const isO3 = (model: { id: string }) => !!model.id.match(/^o3(.*)/)

export const isCodex = (model: { id: string }) => !!model.id.match(/^codex(.*)/)

export const isOpenAISearch = (model: { id: string }) => model.id.startsWith('gpt') && model.id.includes('search-preview')

export const isDeepseekR1 = (model: { id: string }) => !!model.id.match(/^deepseek-r1(.*)/)

export const isEmbeddings = (model: IModel | string) => !!(typeof model === 'string' ? model : model.id).match(/^text-embedding(.*)/)
