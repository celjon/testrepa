import { Field, ID, ObjectType } from 'type-graphql'
import { Employee, EmployeeModel, EnterpriseRole } from '@prisma/client'
import { IUser, UserGraphQLObject } from './user'
import { EnterpriseGraphQLObject, IEnterprise } from './enterprise'

export interface IEmployee extends Employee {
  user?: IUser
  enterprise?: IEnterprise
  allowed_models?: Array<EmployeeModel>
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

  @Field(() => EnterpriseGraphQLObject, { nullable: true })
  enterprise?: EnterpriseGraphQLObject

  @Field(() => EnterpriseRole)
  role!: EnterpriseRole

  @Field(() => [EmployeeModelGraphQLObject], { nullable: true })
  allowed_models?: Array<EmployeeModel>
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
