import { Field, ID, ObjectType } from 'type-graphql'
import { Currency, ReferralTemplate } from '@prisma/client'
import { IPlan, PlanGraphQLObject } from './plan'

/**
 * @openapi
 * components:
 *   entities:
 *      ReferralTemplate:
 *        properties:
 *           id:
 *             type: string
 *           name:
 *             type: string
 *           locale:
 *             type: string
 *           min_withdraw_amount:
 *             type: number
 *           encouragement_percentage:
 *             type: number
 *           currency:
 *             type: string
 *           plan_id:
 *             type: string
 *           tokens:
 *             type: number
 *           private:
 *             type: boolean
 *           plan:
 *             $ref: '#/components/entities/Plan'
 */
export interface IReferralTemplate extends ReferralTemplate {
  plan: IPlan
}

@ObjectType('ReferralTemplate')
export class ReferralTemplateGraphQLObject implements IReferralTemplate {
  @Field(() => ID)
  id!: string

  @Field(() => String)
  name!: string

  @Field(() => String)
  locale!: string

  @Field(() => Number)
  min_withdraw_amount!: number

  @Field(() => Number)
  encouragement_percentage!: number

  @Field(() => Number)
  caps_encouragement_percentage!: number

  @Field(() => Currency)
  currency!: Currency

  @Field(() => ID)
  plan_id!: string

  @Field(() => PlanGraphQLObject)
  plan!: IPlan

  @Field(() => Number)
  tokens!: number

  @Field(() => Boolean)
  private!: boolean

  @Field(() => Boolean)
  disabled!: boolean
}
