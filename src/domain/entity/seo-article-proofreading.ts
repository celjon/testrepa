import { Field, ID, ObjectType } from 'type-graphql'
import { ArticleGraphQLObject, IArticle } from '@/domain/entity/article'
import { SEOArticleProofreading } from '@prisma/client'
import { SEOArticleExpertGraphQLObject, ISEOArticleExpert } from '@/domain/entity/seo-article-expert'

export interface ISEOArticleProofreading extends SEOArticleProofreading {}

@ObjectType('SEOArticleProofreading')
export class SEOArticleProofreadingGraphQLObject implements ISEOArticleProofreading {
  @Field(() => ID)
  id!: string

  @Field(() => Date, { defaultValue: Date.now() })
  created_at!: Date

  @Field(() => String)
  expert_id!: string

  @Field(() => [SEOArticleExpertGraphQLObject], { nullable: true })
  expert?: ISEOArticleExpert

  @Field(() => String)
  article_id!: string

  @Field(() => [ArticleGraphQLObject], { nullable: true })
  article?: IArticle
}

/**
 * @openapi
 * components:
 *   entities:
 *     SEOArticleProofreading:
 *       required:
 *         - id
 *         - expert_id
 *         - article_id
 *         - created_at
 *       properties:
 *         id:
 *           type: string
 *         expert_id:
 *           type: string
 *         expert:
 *           $ref: '#/components/entities/SEOArticleExpert'
 *         article_id:
 *           type: string
 *         article:
 *           $ref: '#/components/entities/Article'
 *         created_at:
 *           type: string
 *           format: date
 */
