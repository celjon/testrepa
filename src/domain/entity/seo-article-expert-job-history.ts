import { SEOArticleExpertJobHistory } from '@prisma/client'
import { Field, ID, ObjectType } from 'type-graphql'

export interface ISEOArticleExpertJobHistory extends SEOArticleExpertJobHistory {}

@ObjectType('SEOArticleExpertJobHistory')
export class SEOArticleExpertJobHistoryGraphQLObject implements ISEOArticleExpertJobHistory {
  @Field(() => ID)
  id!: string

  @Field(() => String)
  post!: string

  @Field(() => Date)
  from_date!: Date

  @Field(() => Date)
  to_date!: Date

  @Field(() => String)
  company!: string

  @Field(() => String)
  city!: string

  @Field(() => [String])
  duties!: string[]

  @Field(() => [String])
  achievements!: string[]

  @Field(() => String)
  description!: string

  @Field(() => String)
  seo_expert_id!: string

  @Field(() => [SEOArticleExpertJobHistoryGraphQLObject], { nullable: true })
  expert!: string
}

/**
 * @openapi
 * components:
 *   entities:
 *     SEOArticleExpertJobHistory:
 *       required:
 *         - id
 *         - post
 *         - from_date
 *         - to_date
 *         - company
 *         - city
 *         - duties
 *         - achievements
 *         - description
 *         - seo_expert_id
 *       properties:
 *         id:
 *           type: string
 *         post:
 *           type: string
 *         from_date:
 *           type: string
 *           format: date
 *         to_date:
 *           type: string
 *           format: date
 *         company:
 *           type: string
 *         city:
 *           type: string
 *         duties:
 *           type: string
 *         achievements:
 *           type: string
 *         description:
 *           type: string
 *         seo_expert_id:
 *           type: string
 *         expert:
 *           $ref: '#/components/entities/SEOArticleExpert'
 */
