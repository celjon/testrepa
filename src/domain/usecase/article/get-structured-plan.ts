import dedent from 'dedent'
import { ArticleLinkStyle, ArticleStyle, Platform } from '@prisma/client'
import { config } from '@/config'
import { logger } from '@/lib/logger'
import { InvalidDataError } from '@/domain/errors'
import { IModel } from '@/domain/entity/model'
import { ISubscription } from '@/domain/entity/subscription'
import { IEmployee } from '@/domain/entity/employee'
import { UseCaseParams } from '../types'
import {
  ArticleStructuredPlan,
  articleStructuredPlanResponseFormat,
  articleStructuredPlanSchema,
} from './types'
import { articlePrompts } from './article-prompts'
import { ValidArticleStyle } from '@/domain/entity/article'

type Params = UseCaseParams

export type GetStructuredPlan = (params: {
  articlePlan: string
  articleStyle: ValidArticleStyle
  customStyle: string
  articleLinkStyle: ArticleLinkStyle
  symbolsCount: number
  language: string
  userId: string
  model: IModel
  subscription?: ISubscription
  employee: IEmployee | null
  isAdmin?: boolean
  developerKeyId?: string
}) => Promise<ArticleStructuredPlan>

const generateSourcesChapter = true
export const buildGetStructuredPlan = ({ service, adapter }: Params): GetStructuredPlan => {
  return async ({
    articlePlan,
    articleStyle,
    customStyle,
    articleLinkStyle,
    symbolsCount,
    language,
    userId,
    model,
    subscription,
    employee,
    isAdmin,
    developerKeyId,
  }) => {
    await service.enterprise.checkMonthLimit({ userId })
    const selectedArticleStyle =
      articleStyle === ArticleStyle.CUSTOM
        ? customStyle
        : articlePrompts.en.articleStyle[articleStyle]

    const prompt = dedent`
      You are a JSON structure expert. Your task is to convert the provided article plan into a specific JSON format.

      Use this JSON schema:
      <example>
      {
        "chapters": [
          {
            "chapter": string,
            "symbolsCount": number,
            "type": "general" | "sources"
          }
        ]
      }
      </example>

      Output requirements:
      - ONLY return a pure JSON string
      - DO NOT use any markdown formatting
      - Do NOT wrap the response in \`\`\` tags
      - DO NOT add any explanations or comments
      - The response must be directly parseable by JSON.parse()

      - The maximum number of symbols in the whole article is: 
      <symbolsCount>
        <min>${symbolsCount}</min>
        <max>${symbolsCount * 2}</max>
      </symbolsCount>.
      ${symbolsCount > 15000 ? '- You can make the plan more detailed. Add subchapters, make chapters longer' : ''}
      - Suggest symbols count for each chapter. Symbols count for the beginning and ending chapters must be less than other chapters. Make sure that symbols count for the chapters sum up to value between <min> and <max> symbols.
      - You must add chapters with name: "<chapter> (continue)", so every chapter object has symbolsCount less than 5000. We need this because LLMs are not good in counting symbols. 
      ${symbolsCount >= 30000 ? '- <symbolsCount> is large, you should increase symbolsCount for each chapter by 2000 or more symbols despite the fact that total symbols count will be greater than <symbolsCount>.' : ''} 
      ${symbolsCount < 10000 ? '- <symbolsCount> is small, you should decrease symbolsCount for each chapter, so that total symbols count will be near min symbolsCount. Do not consider subsections starting with "-" as chapters.' : ''}
      - Do not modify chapter names except adding "(continue)" word to the end of the chapter name. But translate chapter names into the specified language. Do not translate mark (continue).
      ${articleLinkStyle === 'DIRECT' && generateSourcesChapter ? '- Make sure that there is "Sources" chapter at the end of the article. Change chapter type to "sources". Do not add any chapters after the sources chapter.' : '- Do not add "Sources" chapter at the end of the article.'}
      - Do not add any other additional text.

      Parameters:
      <plan>${articlePlan}</plan>
      <articleStyle>${selectedArticleStyle}</articleStyle>
      <articleLinkStyle>${articleLinkStyle}: ${
        (articlePrompts[language] || articlePrompts.ru).articleLinkStyle[articleLinkStyle]
      }</articleLinkStyle>
      <language>${(articlePrompts[language] || articlePrompts.ru).language}</language>
    `

    const result = await adapter.openrouterGateway.sync({
      endUserId: userId,
      messages: [],
      settings: {
        model: model.prefix + model.id,
        system_prompt: prompt,
      },
      response_format: articleStructuredPlanResponseFormat,
    })

    const content = result.message.content

    let structuredPlan: { chapters: ArticleStructuredPlan } | null
    try {
      structuredPlan = articleStructuredPlanSchema.parse(JSON.parse(content))
    } catch (error) {
      logger.error('UNABLE_TO_STRUCTURIZE_ARTICLE_PLAN', { error, content })
      throw new InvalidDataError({
        code: 'UNABLE_TO_STRUCTURIZE_ARTICLE_PLAN',
      })
    }

    if (!result.usage) {
      throw new InvalidDataError({
        code: 'UNABLE_TO_STRUCTURIZE_ARTICLE_PLAN',
      })
    }

    const caps = await service.model.getCaps.text({
      model: model,
      usage: result.usage,
    })

    if (!isAdmin && subscription) {
      await service.subscription.writeOffWithLimitNotification({
        subscription,
        amount: caps,
        meta: {
          userId: userId,
          enterpriseId: employee?.enterprise_id,
          platform: Platform.EASY_WRITER,
          model_id: model.id,
          provider_id: config.model_providers.openrouter.id,
          developerKeyId,
        },
      })
    }
    return structuredPlan.chapters
  }
}
