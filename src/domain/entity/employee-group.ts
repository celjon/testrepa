import { Field, ID, ObjectType } from 'type-graphql'
import { EmployeeGraphQLObject, IEmployee } from '@/domain/entity/employee'
import { EmployeeGroup, EmployeeGroupModel } from '@prisma/client'
import { EnterpriseGraphQLObject } from '@/domain/entity/enterprise'

export interface IEmployeeGroup extends EmployeeGroup {
  employees?: IEmployee[]
  allowed_models?: Array<EmployeeGroupModel>
}

@ObjectType('EmployeeGroup')
export class EmployeeGroupGraphQLObject implements IEmployeeGroup {
  @Field(() => ID)
  id!: string

  @Field(() => String)
  label!: string

  @Field(() => BigInt)
  spend_limit_on_month!: bigint | null

  @Field(() => ID)
  enterprise_id!: string

  @Field(() => EnterpriseGraphQLObject, { nullable: true })
  enterprise?: EnterpriseGraphQLObject

  @Field(() => [EmployeeGroupModelGraphQLObject], { nullable: true })
  allowed_models?: EmployeeGroupModel[]

  @Field(() => [EmployeeGraphQLObject], { nullable: true })
  employees?: IEmployee[]
}

@ObjectType('EmployeeGroupModel')
export class EmployeeGroupModelGraphQLObject implements EmployeeGroupModel {
  @Field(() => ID)
  id!: string

  @Field(() => ID)
  employee_group_id!: string

  @Field(() => ID)
  model_id!: string
}
