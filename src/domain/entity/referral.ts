import { Field, ID, ObjectType } from 'type-graphql'
import { Referral } from '@prisma/client'
import { IReferralParticipant, ReferralParticipantGraphQLObject } from './referral-participant'
import { IReferralTemplate, ReferralTemplateGraphQLObject } from './referral-template'
import { ITransaction, TransactionGraphQLObject } from './transaction'
import { IUser, UserGraphQLObject } from './user'

/**
 * @openapi
 * components:
 *   entities:
 *      Referral:
 *        required:
 *          - id
 *          - owner_id
 *        properties:
 *          id:
 *            type: string
 *          name:
 *            type: string
 *          owner_id:
 *            type: string
 *          template_id:
 *            type: string
 *          balance:
 *            type: number
 *          code:
 *            type: string
 */
export interface IReferral extends Referral {
  template?: IReferralTemplate
  owner?: IUser
  participants?: Array<IReferralParticipant>
  transactions?: Array<ITransaction>
}

export interface IReferralWithStats extends IReferral {
  amount_spend_by_users: number
  participants_count: number
  paid_participants_count: number
}

@ObjectType('Referral')
export class ReferralGraphQLObject implements IReferral {
  @Field(() => ID)
  id!: string

  @Field(() => String)
  name!: string

  @Field(() => ID)
  owner_id!: string

  @Field(() => UserGraphQLObject)
  owner!: IUser

  @Field(() => ID)
  template_id!: string

  @Field(() => ReferralTemplateGraphQLObject)
  template!: IReferralTemplate

  @Field(() => [ReferralParticipantGraphQLObject])
  participants!: Array<IReferralParticipant>

  @Field(() => [TransactionGraphQLObject])
  transactions!: Array<ITransaction>

  @Field(() => Number)
  balance!: number

  @Field(() => String)
  code!: string

  @Field(() => Boolean)
  disabled!: boolean

  @Field(() => Date)
  last_withdrawed_at!: Date

  @Field(() => Date)
  created_at!: Date
}
