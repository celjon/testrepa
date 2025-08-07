import { Field, ID, ObjectType } from 'type-graphql'
import { ExchangeRate } from '@prisma/client'
import { GraphQLDateTime } from 'graphql-scalars'

export const MAX_ITEMS = 20

export interface IExchangeRate extends ExchangeRate {}

@ObjectType('ExchangeRate')
export class ExchangeRateGraphQLObject implements IExchangeRate {
  @Field(() => ID)
  id!: string

  @Field(() => GraphQLDateTime)
  start_date!: Date

  @Field(() => Number)
  caps_per_rub!: number

  @Field(() => Number)
  caps_per_usd!: number

  @Field(() => GraphQLDateTime)
  created_at!: Date
}

/**
 * @openapi
 * components:
 *   entities:
 *     ExchangeRate:
 *       required:
 *         - id
 *         - start_date
 *         - rub
 *         - usd
 *         - created_at
 *       properties:
 *         id:
 *           type: string
 *         start_date:
 *           type: string
 *           format: date-time
 *         rub:
 *           type: number
 *         usd:
 *           type: number
 *         created_at:
 *           type: string
 *           format: date-time
 */
