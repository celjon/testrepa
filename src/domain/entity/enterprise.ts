import { Field, ID, ObjectType } from 'type-graphql'
import { Enterprise, EnterpriseCreator, EnterpriseType } from '@prisma/client'
import { Response } from 'express'
import { createSubscriptionManager } from '@/lib'
import { EmployeeGraphQLObject, IEmployee } from './employee'
import { ISubscription, SubscriptionGraphQLObject } from './subscription'

export interface IEnterprise extends Enterprise {
  employees?: Array<IEmployee>
  subscription?: ISubscription
}

@ObjectType('Enterprise')
export class EnterpriseGraphQLObject implements IEnterprise {
  @Field(() => ID)
  id!: string

  @Field(() => String)
  name!: string

  @Field(() => EnterpriseType)
  type!: EnterpriseType

  @Field(() => String, { nullable: true })
  agreement_conclusion_date!: string | null

  @Field(() => Number, { nullable: false, defaultValue: 250 })
  rubs_per_million_caps!: number

  @Field(() => EnterpriseCreator)
  creator!: EnterpriseCreator

  @Field(() => Boolean)
  common_pool!: boolean

  @Field(() => SubscriptionGraphQLObject, { nullable: true })
  subscription?: ISubscription

  @Field(() => [EmployeeGraphQLObject], { nullable: true })
  employees?: Array<EmployeeGraphQLObject>

  @Field(() => Date)
  created_at!: Date
}

export const subscriptionWatcher = createSubscriptionManager<Response, ISubscription>((r, v) => {
  r.status(200).json(v)
})
