import { Field, ID, ObjectType } from 'type-graphql'
import { SEOArticleCategory } from '@prisma/client'
import { ISEOArticleTopic, SEOArticleTopicGraphQLObject } from '@/domain/entity/seo-article-topic'
import { GraphQLJSON } from 'graphql-scalars'

export interface ISEOArticleCategory extends SEOArticleCategory {}

@ObjectType('SEOArticleCategory')
export class SEOArticleCategoryGraphQLObject implements ISEOArticleCategory {
  @Field(() => ID)
  id!: string

  @Field(() => GraphQLJSON)
  name!: {
    ru: string
    en: string
    es: string
    fr: string
    pt: string
  }
  @Field(() => String)
  slug!: string

  @Field(() => [SEOArticleTopicGraphQLObject], { nullable: true })
  seoArticleTopic?: Array<ISEOArticleTopic>
}
/**
 * @openapi
 * components:
 *   entities:
 *     SEOArticleCategory:
 *       required:
 *         - id
 *         - name
 *         - slug
 *       properties:
 *         id:
 *           type: string
 *         name:
 *           type: object
 *           properties:
 *             ru:
 *               type: string
 *             en:
 *               type: string
 *             es:
 *               type: string
 *             fr:
 *               type: string
 *             pt:
 *               type: string
 *         slug:
 *           type: string
 *         topics:
 *           $ref: '#/components/entities/SEOArticleTopic'
 */
