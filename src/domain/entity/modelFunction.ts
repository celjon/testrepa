import { Field, ID, ObjectType } from 'type-graphql'
import { ModelFunction, Prisma } from '@prisma/client'

/**
 * @openapi
 * components:
 *   entities:
 *      ModelFunction:
 *          required:
 *            - id
 *            - is_default
 *            - order
 *            - used_count
 *            - created_at
 *          properties:
 *            id:
 *                type: string
 *            name:
 *                type: string
 *            label:
 *                  oneOf:
 *                    - type: null
 *                    - type: string
 *            features:
 *                  oneOf:
 *                    - type: null
 *                    - type: object
 *            is_default:
 *                type: boolean
 *            order:
 *                type: number
 *            model_id:
 *                  oneOf:
 *                    - type: null
 *                    - type: string
 *            used_count:
 *                type: number
 *            created_at:
 *                type: string
 *                format: date
 */
export interface IModelFunction extends ModelFunction {}

@ObjectType('ModelFunction')
export class ModelFunctionGraphQLObject implements IModelFunction {
  @Field(() => ID)
  id!: string

  @Field(() => String)
  name!: string

  @Field(() => String, { nullable: true })
  label!: string | null

  @Field(() => Boolean)
  is_default!: boolean

  @Field(() => Object, { nullable: true })
  features!: Prisma.JsonValue | null

  @Field(() => Number)
  order!: number

  @Field(() => ID, { nullable: true })
  model_id!: string | null

  @Field(() => Number)
  used_count!: number

  @Field(() => Date)
  created_at!: Date
}
