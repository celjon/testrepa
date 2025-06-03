import { Field, ID, ObjectType } from 'type-graphql'
import { ArticleGraphQLObject } from '@/domain/entity/article'
import { SEOArticleCategoryGraphQLObject } from '@/domain/entity/seo-article-category'
import { SEOArticleTopic } from '@prisma/client'
import { GraphQLJSON } from 'graphql-scalars'

export interface ISEOArticleTopic extends SEOArticleTopic {
  name: {
    ru: string
    en: string
    es: string
    fr: string
    pt: string
  }
}

@ObjectType('SEOArticleTopic')
export class SEOArticleTopicGraphQLObject implements ISEOArticleTopic {
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

  @Field(() => ArticleGraphQLObject)
  article!: ArticleGraphQLObject

  @Field(() => ID)
  article_id!: string

  @Field(() => SEOArticleCategoryGraphQLObject)
  category!: SEOArticleCategoryGraphQLObject

  @Field(() => ID)
  category_id!: string
}
export type LocalizedName = {
  ru: string
  en: string
  es: string
  fr: string
  pt: string
}
/**
 * @openapi
 * components:
 *   entities:
 *     SEOArticleTopic:
 *       required:
 *         - id
 *         - name
 *         - slug
 *         - article_id
 *         - category_id
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
 *         article_id:
 *           type: string
 *         article:
 *           $ref: '#/components/entities/Article'
 *         category_id:
 *           type: string
 *         category:
 *           $ref: '#/components/entities/SEOArticleCategory'
 */
