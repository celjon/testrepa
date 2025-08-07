import { Field, ID, ObjectType } from 'type-graphql'
import { EnterprisePaymentPlanStatus, Subscription } from '@prisma/client'
import { IUser, UserGraphQLObject } from './user'
import { IPlan, PlanGraphQLObject } from './plan'
import { EnterpriseGraphQLObject, IEnterprise } from './enterprise'

export interface ISubscription extends Subscription {
  user?: IUser
  enterprise?: IEnterprise
  plan?: IPlan
}

@ObjectType('Subscription')
export class SubscriptionGraphQLObject implements ISubscription {
  @Field(() => ID)
  id!: string

  @Field(() => ID, { nullable: true })
  plan_id!: string | null

  @Field(() => PlanGraphQLObject, { nullable: true })
  plan?: IPlan

  @Field(() => BigInt)
  tokens!: bigint

  @Field(() => ID, { nullable: true })
  user_id!: string | null

  @Field(() => UserGraphQLObject, { nullable: true })
  user!: UserGraphQLObject

  @Field(() => ID)
  enterprise_id!: string

  @Field(() => EnterpriseGraphQLObject)
  enterprise!: EnterpriseGraphQLObject

  @Field(() => EnterprisePaymentPlanStatus)
  payment_plan!: EnterprisePaymentPlanStatus

  @Field(() => BigInt)
  balance!: bigint

  @Field(() => Number)
  credit_limit!: number

  //DELETE AFTER RUM MIGRATION SCRIPT
  @Field(() => Number)
  hard_limit!: number

  @Field(() => Number)
  soft_limit!: number

  @Field(() => Number)
  system_limit!: number

  @Field(() => Date)
  created_at!: Date
}

/**
 * @openapi
 * components:
 *   entities:
 *      Subscription:
 *          required:
 *            - id
 *            - plan_id
 *            - user_id
 *            - enterprise_id
 *            - balance
 *            - payment_plan
 *            - credit_limit
 *            - soft_limit
 *            - system_limit
 *            - created_at
 *          properties:
 *            id:
 *                type: string
 *            plan_id:
 *                type: string
 *            user_id:
 *                type: string
 *            enterprise_id:
 *                type: string
 *            balance:
 *                type: number
 *            payment_plan:
 *                type: string
 *            credit_limit:
 *                type: number
 *            soft_limit:
 *                type: number
 *            system_limit:
 *                type: number
 *            created_at:
 *                type: string
 *                format: date
 */
