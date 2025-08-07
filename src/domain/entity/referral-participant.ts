import { Field, ID, ObjectType } from 'type-graphql'
import { ReferralParticipant } from '@prisma/client'
import { IReferral, ReferralGraphQLObject } from './referral'
import { IUser, UserGraphQLObject } from './user'

export interface IReferralParticipant extends ReferralParticipant {
  referral: IReferral
}

@ObjectType('ReferralParticipant')
export class ReferralParticipantGraphQLObject implements IReferralParticipant {
  @Field(() => ID)
  id!: string

  @Field(() => String)
  user_id!: string

  @Field(() => UserGraphQLObject)
  user!: IUser

  @Field(() => String)
  referral_id!: string

  @Field(() => ReferralGraphQLObject)
  referral!: IReferral

  @Field(() => Date)
  created_at!: Date
}
