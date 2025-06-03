import { Article, ArticleLinkStyle, ArticleStyle } from '@prisma/client'
import { IUser, UserGraphQLObject } from './user'
import { IModel, ModelGraphQLObject } from './model'
import { ISEOArticleTopic, SEOArticleTopicGraphQLObject } from '@/domain/entity/seo-article-topic'
import { Field, Float, ID, ObjectType } from 'type-graphql'
import { ISEOArticleProofreading, SEOArticleProofreadingGraphQLObject } from '@/domain/entity/seo-article-proofreading'
import { ChatGraphQLObject, IChat } from '@/domain/entity/chat'

export type ValidArticleStyle = Exclude<ArticleStyle, 'FRIENDLY' | 'NEUTRAL' | 'INSPIRATIONAL' | 'HUMOROUS' | 'SCIENTIFIC'>

export interface IArticle extends Article {
  user?: IUser
  model?: IModel
  topics?: ISEOArticleTopic[]
}

export enum IArticleLanguage {
  ru = 'ru',
  en = 'en',
  es = 'es',
  fr = 'fr',
  pt = 'pt'
}

@ObjectType('Article')
export class ArticleGraphQLObject implements IArticle {
  @Field(() => ID)
  id!: string

  @Field(() => String, { nullable: true })
  slug!: string

  @Field(() => String)
  user_id!: string

  @Field(() => String)
  model_id!: string

  @Field(() => String, { defaultValue: '' })
  generationMode!: string

  @Field(() => String)
  subject!: string

  @Field(() => String)
  plan!: string

  @Field(() => Float, { defaultValue: 1 })
  creativity!: number

  @Field(() => ArticleStyle)
  style!: ArticleStyle

  @Field(() => String)
  customStyle!: string

  @Field(() => ArticleLinkStyle)
  linkStyle!: ArticleLinkStyle

  @Field(() => Number)
  symbolsCount!: number

  @Field(() => String)
  sourceContent!: string

  @Field(() => String)
  sourceLink!: string

  @Field(() => Number)
  spentCaps!: number

  @Field(() => String)
  chat_id!: string

  @Field(() => String)
  title!: string

  @Field(() => IArticleLanguage)
  language!: IArticleLanguage

  @Field(() => Number)
  symbols_count!: number

  @Field(() => Date, { defaultValue: Date.now() })
  created_at!: Date

  @Field(() => String)
  keywords!: string

  @Field(() => String)
  content!: string

  @Field(() => Date)
  published_at!: Date

  @Field(() => [UserGraphQLObject], { nullable: true })
  user?: IUser

  @Field(() => [ModelGraphQLObject], { nullable: true })
  model?: IModel

  @Field(() => [ChatGraphQLObject], { nullable: true })
  chat?: IChat

  @Field(() => [SEOArticleTopicGraphQLObject], { nullable: true })
  topics?: ISEOArticleTopic[]

  @Field(() => [SEOArticleProofreadingGraphQLObject], { nullable: true })
  proofreadings?: ISEOArticleProofreading[]
}

/**
 * @openapi
 * components:
 *   entities:
 *     Article:
 *       required:
 *         - id
 *         - slug
 *         - user_id
 *         - model_id
 *         - generationMode
 *         - subject
 *         - plan
 *         - creativity
 *         - style
 *         - customStyle
 *         - language
 *         - symbolsCount
 *         - sourceLink
 *         - content
 *         - spentCaps
 *         - chat_id
 *         - created_at
 *       properties:
 *         id:
 *           type: string
 *         slug:
 *           type: string
 *         user_id:
 *           type: string
 *         user:
 *           $ref: '#/components/entities/User'
 *         model_id:
 *           type: string
 *         model:
 *           $ref: '#/components/entities/Model'
 *         generationMode:
 *           type: string
 *         subject:
 *           type: string
 *         plan:
 *           type: string
 *         creativity:
 *           type: number
 *         style:
 *           type: string
 *         customStyle:
 *           type: string
 *         linkStyle:
 *           type: string
 *         language:
 *           type: string
 *         symbolsCount:
 *           type: number
 *         keywords:
 *           type: string
 *         sourceContent:
 *           type: string
 *         sourceLink:
 *           type: string
 *         content:
 *           type: string
 *         spentCaps:
 *           type: string
 *         chat_id:
 *           type: string
 *         chat:
 *           $ref: '#/components/entities/Chat'
 *         created_at:
 *           type: string
 *           format: date
 *         published_at:
 *           type: string
 *           format: date
 *         topics:
 *           $ref: '#/components/entities/SEOArticleTopic'
 *         proofreadings:
 *           $ref: '#/components/entities/SEOArticleProofreading'
 */
