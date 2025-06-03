import { Field, ID, ObjectType } from 'type-graphql'
import { Currency, Plan, PlanModel, PlanType as PT } from '@prisma/client'
import { ISubscription, SubscriptionGraphQLObject } from './subscription'
import { ITransaction, TransactionGraphQLObject } from './transaction'
import { IModel, ModelGraphQLObject } from './model'

export interface IPlan extends Plan {
  subscriptions: Array<ISubscription>
  transactions: Array<ITransaction>
  models: Array<IPlanModel>
}

export interface IPlanModel extends PlanModel {
  plan: IPlan
  model: IModel
}

export const PlanType = PT
export type TPlanType = PT

@ObjectType('Plan')
export class PlanGraphQLObject implements IPlan {
  @Field(() => ID)
  id!: string

  @Field(() => PlanType)
  type!: TPlanType

  @Field(() => Number)
  price!: number

  @Field(() => Currency)
  currency!: Currency

  @Field(() => Number)
  tokens!: number

  @Field(() => [SubscriptionGraphQLObject])
  subscriptions!: Array<ISubscription>

  @Field(() => [TransactionGraphQLObject])
  transactions!: Array<ITransaction>

  @Field(() => [PlanModelGraphQLObject])
  models!: Array<IPlanModel>
}

@ObjectType('PlanModel')
export class PlanModelGraphQLObject implements IPlanModel {
  @Field(() => ID)
  id!: string

  @Field(() => ID)
  plan_id!: string

  @Field(() => PlanGraphQLObject)
  plan!: IPlan

  @Field(() => ID)
  model_id!: string

  @Field(() => ModelGraphQLObject)
  model!: IModel

  @Field(() => Boolean)
  is_default_model!: boolean

  @Field(() => Date)
  created_at!: Date

  @Field(() => Date, { nullable: true })
  deleted_at!: Date
}

/**
 * @openapi
 * components:
 *   entities:
 *      Plan:
 *          required:
 *            - id
 *            - type
 *            - price
 *            - currency
 *            - tokens
 *          properties:
 *            id:
 *                type: string
 *            type:
 *                type: string
 *                enum: [FREE, BASIC, PREMIUM, DELUXE, ELITE]
 *            price:
 *                type: number
 *            currency:
 *                type: string
 *                enum: [RUB, EUR, USD]
 *            tokens:
 *                type: number
 */
