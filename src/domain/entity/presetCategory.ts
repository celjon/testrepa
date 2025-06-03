import { Field, ID, ObjectType } from 'type-graphql'
import { PresetCategory } from '@prisma/client'
import { IPreset, PresetGraphQLObject } from './preset'

/**
 * @openapi
 * components:
 *   entities:
 *      PresetCategory:
 *          required:
 *            - id
 *            - code
 *            - name
 *            - created_at
 *          properties:
 *            id:
 *                type: string
 *            code:
 *                type: string
 *            name:
 *                type: string
 *            created_at:
 *                type: string
 *                format: date
 */
export interface IPresetCategory extends PresetCategory {
  presets?: IPreset[]
}

@ObjectType('PresetCategory')
export class PresetCategoryGraphQLObject implements IPresetCategory {
  @Field(() => ID)
  id!: string

  @Field(() => String)
  locale!: string

  @Field(() => String)
  code!: string

  @Field(() => String)
  name!: string

  @Field(() => Date)
  created_at!: Date

  @Field(() => [PresetGraphQLObject])
  presets?: PresetGraphQLObject[]
}
