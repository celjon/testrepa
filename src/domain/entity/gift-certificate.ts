import { Field, ID, ObjectType } from 'type-graphql'
import { GiftCertificate, PlanType } from '@prisma/client'

export interface IGiftCertificate extends GiftCertificate {}

@ObjectType('GiftCertificate')
export class GiftCertificateGraphQLObject implements IGiftCertificate {
  @Field(() => ID)
  id!: string

  @Field(() => String)
  code!: string

  @Field(() => String)
  from_user_id!: string

  @Field(() => BigInt)
  amount!: bigint

  @Field(() => PlanType)
  plan!: PlanType

  @Field(() => String, { nullable: true })
  message!: string | null

  @Field(() => String, { nullable: true })
  recipient_name!: string | null

  @Field(() => Date, { defaultValue: new Date() })
  created_at!: Date
}

/**
 * @openapi
 * components:
 *   entities:
 *     GiftCertificate:
 *       required:
 *         - id
 *         - code
 *         - from_user_id
 *         - gifter_email
 *         - amount
 *         - created_at
 *       properties:
 *         id:
 *           type: string
 *         code:
 *           type: string
 *         from_user_id:
 *           type: string
 *         gifter_email:
 *           type: string
 *         amount:
 *           type: string
 *         message:
 *           type: string
 *         recipient_name:
 *           type: string
 *         created_at:
 *           type: string
 *           format: date
 */
