import { Field, ID, ObjectType } from 'type-graphql'
import { SEOArticleExpert } from '@prisma/client'
import { ISEOArticleProofreading, SEOArticleProofreadingGraphQLObject } from '@/domain/entity/seo-article-proofreading'
import { ISEOArticleExpertJobHistory, SEOArticleExpertJobHistoryGraphQLObject } from '@/domain/entity/seo-article-expert-job-history'
import { GraphQLJSON } from 'graphql-scalars'

export interface ISEOArticleExpert extends SEOArticleExpert {}

@ObjectType('SEOArticleExpert')
export class SEOArticleExpertGraphQLObject implements ISEOArticleExpert {
  @Field(() => ID)
  id!: string

  @Field(() => String)
  name!: string

  @Field(() => String, { nullable: false })
  slug!: string

  @Field(() => String, { nullable: true })
  email!: string

  @Field(() => String, { nullable: true })
  telegram!: string

  @Field(() => String)
  bio!: string

  @Field(() => String)
  city!: string

  @Field(() => String)
  country!: string

  @Field(() => [SEOArticleExpertJobHistoryGraphQLObject], { nullable: true })
  experience!: ISEOArticleExpertJobHistory[]

  @Field(() => GraphQLJSON)
  education!: {
    university: string
    level: string
    form: string
    graduationYear: number
    faculty: string
    specialty: string
  }

  @Field(() => String)
  qualification!: string

  @Field(() => Date, { defaultValue: Date.now() })
  created_at!: Date

  @Field(() => [SEOArticleProofreadingGraphQLObject], { nullable: true })
  proofreadings?: ISEOArticleProofreading[]
}
/**
 * @openapi
 * components:
 *   entities:
 *      SEOArticleExpert:
 *          required:
 *            - id
 *            - name
 *            - slug
 *            - email
 *            - telegram
 *            - bio
 *            - city
 *            - country
 *            - education
 *            - qualification
 *            - created_at
 *          properties:
 *            id:
 *              type: string
 *            name:
 *              type: string
 *            slug:
 *              type: string
 *            email:
 *              type: string
 *            telegram:
 *              type: string
 *            bio:
 *              type: string
 *            city:
 *              type: string
 *            country:
 *              type: string
 *            education:
 *              type: object
 *              properties:
 *                university:
 *                  type: string
 *                level:
 *                  type: string
 *                form:
 *                  type: string
 *                graduationYear:
 *                  type: integer
 *                faculty:
 *                  type: string
 *                specialty:
 *                  type: string
 *            qualification:
 *              type: string
 *            created_at:
 *              type: string
 *              format: date
 *            experience:
 *              $ref: '#/components/entities/SEOArticleExpertJobHistory'
 *            proofreadings:
 *              $ref: '#/components/entities/SEOArticleProofreading'
 */
