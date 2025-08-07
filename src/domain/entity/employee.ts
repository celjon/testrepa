import { Field, ID, ObjectType } from 'type-graphql'
import { Employee, EmployeeModel, EnterpriseRole } from '@prisma/client'
import { IUser, UserGraphQLObject } from './user'
import { EnterpriseGraphQLObject, IEnterprise } from './enterprise'
import { EmployeeGroupGraphQLObject, IEmployeeGroup } from '@/domain/entity/employee-group'

export interface IEmployee extends Employee {
  user?: IUser
  enterprise?: IEnterprise
  allowed_models?: Array<EmployeeModel>
  employee_group?: IEmployeeGroup
}

@ObjectType('Employee')
export class EmployeeGraphQLObject implements IEmployee {
  @Field(() => ID)
  id!: string

  @Field(() => ID)
  user_id!: string

  @Field(() => UserGraphQLObject, { nullable: true })
  user?: IUser

  @Field(() => ID)
  enterprise_id!: string

  @Field(() => ID, { nullable: true })
  employee_group_id!: string | null

  @Field(() => EmployeeGroupGraphQLObject, { nullable: true })
  employee_group?: EmployeeGroupGraphQLObject

  @Field(() => EnterpriseGraphQLObject, { nullable: true })
  enterprise?: EnterpriseGraphQLObject

  @Field(() => EnterpriseRole)
  role!: EnterpriseRole

  @Field(() => [EmployeeModelGraphQLObject], { nullable: true })
  allowed_models?: Array<EmployeeModel>

  @Field(() => BigInt, { nullable: true, defaultValue: 0n })
  spent_in_month!: bigint | null

  @Field(() => BigInt)
  spend_limit_on_month!: bigint | null
}

@ObjectType('EmployeeModel')
export class EmployeeModelGraphQLObject implements EmployeeModel {
  @Field(() => ID)
  id!: string

  @Field(() => ID)
  employee_id!: string

  @Field(() => ID)
  model_id!: string

  @Field(() => Number)
  usage_count!: number
}
