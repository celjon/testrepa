import { Field, ID, ObjectType } from 'type-graphql'
import {
  Currency,
  Transaction,
  TransactionProvider,
  TransactionStatus,
  TransactionType,
} from '@prisma/client'
import { IPlan } from './plan'
import { IUser } from './user'
import { IMessage } from './message'
import { IAction } from './action'

export interface ITransaction extends Transaction {
  plan?: IPlan | null
  user?: IUser
  from_user?: IUser
  message?: IMessage
  actions?: IAction[]
}

@ObjectType('Transaction')
export class TransactionGraphQLObject implements ITransaction {
  @Field(() => ID)
  id!: string

  @Field(() => TransactionProvider)
  provider!: TransactionProvider

  @Field(() => Number)
  amount!: number

  @Field(() => Currency)
  currency!: Currency

  @Field(() => Object)
  meta!: any

  @Field(() => TransactionStatus)
  status!: TransactionStatus

  @Field(() => TransactionType)
  type!: TransactionType

  @Field(() => ID, { nullable: true })
  plan_id!: string | null

  @Field(() => ID, { nullable: true })
  user_id!: string | null

  @Field(() => ID, { nullable: true })
  referral_id!: string | null

  @Field(() => ID, { nullable: true })
  external_id!: string | null

  @Field(() => ID, { nullable: true })
  from_user_id!: string | null

  @Field(() => ID, { nullable: true })
  enterprise_id!: string | null

  @Field(() => Boolean)
  deleted!: boolean

  @Field(() => Date)
  created_at!: Date

  @Field(() => ID, { nullable: true })
  developer_key_id!: string | null
}

/**
 * @openapi
 * components:
 *   entities:
 *     Transaction:
 *       required:
 *         - id
 *         - provider
 *         - amount
 *         - currency
 *         - status
 *         - type
 *         - created_at
 *       properties:
 *         id:
 *           type: string
 *         provider:
 *           type: string
 *           enum: [YOOMONEY, CRYPTO, BOTHUB]
 *         currency:
 *           type: string
 *           enum: [RUB, USD, EUR, BOTHUB_TOKEN]
 *         meta:
 *           type: object
 *         amount:
 *           type: number
 *         status:
 *           type: string
 *           enum: [FAILED, SUCCEDED, PENDING]
 *         type:
 *           type: string
 *           enum: [SUBSCRIPTION, WRITE_OFF, REPLINSH, WITHDRAW]
 *         plan_id:
 *           type: string
 *         user_id:
 *           type: string
 *         referral_id:
 *           type: string
 *         external_id:
 *           type: string
 *         created_at:
 *           type: string
 *           format: date
 *         developer_key_id:
 *           type: string
 */
