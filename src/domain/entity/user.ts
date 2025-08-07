import { Field, ID, ObjectType } from 'type-graphql'
import { Region, Role, User } from '@prisma/client'
import { ChatGraphQLObject, IChat } from './chat'
import { DeveloperKeyGraphQLObject, IDeveloperKey } from './developer-key'
import { EmployeeGraphQLObject, IEmployee } from './employee'
import { ReferralParticipantGraphQLObject, IReferralParticipant } from './referral-participant'
import { ShortcutGraphQLObject, IShortcut } from './shortcut'
import { StrikeGraphQLObject, IStrike } from './strike'
import { SubscriptionGraphQLObject, ISubscription } from './subscription'
import { TransactionGraphQLObject, ITransaction } from './transaction'
import { GroupGraphQLObject, IGroup } from './group'
import { IOldEmail } from './old-email'
import { RefreshTokenGraphQLObject, IRefreshToken } from './refresh-token'

export interface IUser extends User {
  chats?: Array<IChat>
  developerKeys?: Array<IDeveloperKey>
  employees?: Array<IEmployee>
  groups?: Array<IGroup>
  referral_participants: Array<IReferralParticipant>
  shortcuts?: Array<IShortcut>
  strikes?: Array<IStrike>
  subscription?: ISubscription
  transactions?: Array<ITransaction>
  oldEmails?: Array<IOldEmail>
  refresh_tokens?: Array<IRefreshToken>
}

@ObjectType('User')
export class UserGraphQLObject implements IUser {
  @Field(() => ID)
  id!: string

  @Field(() => String, { nullable: true })
  email!: string | null

  @Field(() => Boolean)
  emailVerified!: boolean

  @Field(() => String, { nullable: true })
  tg_id!: string | null

  @Field(() => String, { nullable: true })
  name!: string | null

  @Field(() => Role)
  role!: Role

  password!: string | null

  @Field(() => String, { nullable: true })
  avatar!: string | null

  @Field(() => String, { nullable: true })
  avatar_id!: string | null

  @Field(() => String, { nullable: true })
  anonymousDeviceFingerprint!: string | null

  @Field(() => Boolean)
  inactive!: boolean

  @Field(() => Boolean)
  disabled!: boolean

  @Field(() => Boolean)
  receiveEmails!: boolean

  @Field(() => Boolean)
  hadSubscriptedForEmails!: boolean

  @Field(() => String, { nullable: true })
  yandexMetricClientId!: string | null

  @Field(() => String, { nullable: true })
  yandexMetricYclid!: string | null

  @Field(() => Boolean)
  useEncryption!: boolean

  @Field(() => [String], { defaultValue: [] })
  old_ids!: string[]

  encryptedDEK!: Uint8Array<ArrayBufferLike> | null

  kekSalt!: Uint8Array<ArrayBufferLike> | null

  @Field(() => Region, { nullable: true })
  region!: Region | null

  @Field(() => Date)
  created_at!: Date

  @Field(() => [ChatGraphQLObject], { nullable: true })
  chats?: Array<IChat>

  @Field(() => [DeveloperKeyGraphQLObject], { nullable: true })
  developerKeys?: Array<IDeveloperKey>

  @Field(() => [EmployeeGraphQLObject], { nullable: true })
  employees?: Array<IEmployee>

  @Field(() => [GroupGraphQLObject], { nullable: true })
  groups?: Array<IGroup>

  @Field(() => [ReferralParticipantGraphQLObject], { nullable: true })
  referral_participants!: Array<IReferralParticipant>

  @Field(() => [ShortcutGraphQLObject], { nullable: true })
  shortcuts?: Array<IShortcut>

  @Field(() => [StrikeGraphQLObject], { nullable: true })
  strikes?: Array<IStrike>

  @Field(() => SubscriptionGraphQLObject, { nullable: true })
  subscription?: ISubscription

  @Field(() => [TransactionGraphQLObject], { nullable: true })
  transactions?: Array<ITransaction>

  @Field(() => [RefreshTokenGraphQLObject], { defaultValue: [] })
  refresh_tokens?: Array<IRefreshToken>

  @Field(() => String, { nullable: true })
  tg_id_before!: string | null
}

/**
 * @openapi
 * components:
 *   entities:
 *      User:
 *          required:
 *            - id
 *            - role
 *            - created_at
 *          properties:
 *            id:
 *                type: string
 *            email:
 *                type: string
 *            tg_id:
 *                type: string
 *            name:
 *                type: string
 *            avatar:
 *                type: string
 *            role:
 *                type: string
 *                enum: [ADMIN, USER]
 *            created_at:
 *                type: string
 *                format: date
 *            emailVerified:
 *                type: boolean
 *            yandexMetricClientId:
 *                type: string
 *            useEncryption:
 *                type: boolean
 *            subscription:
 *                $ref: '#/components/entities/Subscription'
 *            region:
 *                type: string
 *                enum: [RU, KZ, GLOBAL]
 */
