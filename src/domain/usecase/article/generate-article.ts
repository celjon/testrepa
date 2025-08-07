import { extname } from 'path'
import { concatMap, EMPTY, from, Observable, switchMap } from 'rxjs'
import { ArticleLinkStyle, EnterpriseType, Platform, Role } from '@prisma/client'
import { config } from '@/config'
import { extractURLs, getDocumentType } from '@/lib'
import { NotFoundError } from '@/domain/errors'
import { IArticle, IArticleLanguage, ValidArticleStyle } from '@/domain/entity/article'
import { determinePlatform } from '@/domain/entity/action'
import { UseCaseParams } from '../types'
import { ArticleStructuredPlan, File } from './types'
import {
  getGenerateArticleChapterPrompt,
  getGenerateArticlePrompt,
  SYMBOLS_COUNT_LOW_LIMIT,
} from './article-prompts'
import { HandleResponseStreamWithChat } from './handle-response-stream-with-chat'
import { GetChildModel } from './get-child-model'
import { GetStructuredPlan } from './get-structured-plan'
import { logger } from '@/lib/logger'
import { AddSourcesWithPdf } from './add-sources-with-pdf'
import { slugification } from '@/lib/utils/text-slugification'
import { ArticleRepository } from '@/adapter'

const enableSourceSearch = true

type Params = UseCaseParams & {
  handleResponseStreamWithChat: HandleResponseStreamWithChat
  getChildModel: GetChildModel
  getStructuredPlan: GetStructuredPlan
  addSourcesWithPDF: AddSourcesWithPdf
}

export type GenerateArticle = (params: {
  userId: string
  keyEncryptionKey: string | null

  spentCaps?: number
  generationMode: string
  subject: string
  plan: string
  creativity: number

  style: ValidArticleStyle
  customStyle?: string
  customStyleFile?: File

  model_id: string
  language: IArticleLanguage
  linkStyle: ArticleLinkStyle
  symbolsCount: number
  keywords: string
  sourceFile?: File
  sourceLink?: string
  isSEO?: boolean
  isAdmin?: boolean
  developerKeyId?: string
}) => Promise<{
  responseStream$: Observable<{
    status: 'pending' | 'chapterDone' | 'done'
    contentDelta: string
    spentCaps: number | null
    caps: bigint | null
    chatId: string
    articleId: string
    slug?: string | null
  }>
  closeStream: () => void
}>
export const buildGenerateArticle = ({
  adapter,
  service,
  handleResponseStreamWithChat,
  getChildModel,
  getStructuredPlan,
  addSourcesWithPDF,
}: Params): GenerateArticle => {
  const constantCosts = config.constantCosts

  return async ({
    userId,
    keyEncryptionKey,
    model_id,
    sourceFile,
    sourceLink,
    isSEO,
    isAdmin,
    language = IArticleLanguage.ru,
    developerKeyId,
    ...params
  }) => {
    const { model, subscription, employee, plan, user } = await getChildModel({
      model_id,
      userId,
    })
    let totalSpentCaps = params.spentCaps ?? 0
    let sourceContent = ''

    if (sourceFile) {
      sourceContent += await adapter.documentGateway.toMarkdown({
        type: getDocumentType(extname(sourceFile.originalname)),
        buffer: sourceFile.buffer,
      })
    }

    let constantCost = subscription?.plan ? constantCosts[subscription.plan.type] * 10 : 0

    if (employee?.enterprise?.type === EnterpriseType.CONTRACTED) {
      constantCost = 0
    }
    let prompt = getGenerateArticlePrompt({
      ...params,
      language,
      customStyle: params.customStyle ?? '',
      sourceContent,
    })

    //estimate
    if (user?.role !== Role.ADMIN) {
      await service.subscription.checkBalance({
        subscription,
        estimate: await service.model.estimate.easyWriter({
          model,
          prompt,
          constantCost,
          symbolsCount: params.symbolsCount,
        }),
      })
    }
    await service.enterprise.checkMonthLimit({ userId })

    if (sourceLink) {
      const urls = extractURLs(sourceLink)
      if (urls.length > 0) {
        await Promise.all(
          urls.map(async (url) => {
            try {
              const { content } = await adapter.webSearchGateway.getMarkdownContent({
                url,
              })
              sourceContent += content
            } catch (e) {
              logger.error('Failed to load content from url', url)
            }
          }),
        )
      }
    }

    if (params.linkStyle !== ArticleLinkStyle.NONE && enableSourceSearch) {
      const { sources, spentCaps } = await addSourcesWithPDF({
        userId,
        subject: params.subject,
        plan: params.plan,
        language,
        symbolsCount: params.symbolsCount,
        isAdmin,
        developerKeyId,
      })
      if (spentCaps) totalSpentCaps += spentCaps
      sourceContent += sources
    }

    let customStyle = params.customStyle ?? ''
    if (params.customStyleFile) {
      customStyle += '\n'
      customStyle += await adapter.documentGateway.toMarkdown({
        type: getDocumentType(extname(params.customStyleFile.originalname)),
        buffer: params.customStyleFile.buffer,
      })
    }

    let articlePlan: ArticleStructuredPlan = []
    prompt = getGenerateArticlePrompt({
      ...params,
      language,
      customStyle,
      sourceContent,
    })

    if (subscription && params.symbolsCount >= SYMBOLS_COUNT_LOW_LIMIT) {
      articlePlan = await getStructuredPlan({
        articlePlan: params.plan,
        articleStyle: params.style,
        customStyle: customStyle,
        articleLinkStyle: params.linkStyle,
        symbolsCount: params.symbolsCount,
        language,
        userId,
        model,
        subscription,
        employee,
        developerKeyId,
      })

      prompt += `\n\n<structuredPlan>${JSON.stringify(articlePlan, null, 2)}</structuredPlan>`
    } else {
      articlePlan = [
        {
          chapter: '',
          symbolsCount: 0,
          type: 'general',
        },
      ]
    }

    let easyWriterGroup = await adapter.groupRepository.get({
      where: {
        name: 'Easy Writer',
        user_id: userId,
      },
    })

    if (!easyWriterGroup) {
      easyWriterGroup = await adapter.groupRepository.create({
        data: {
          name: 'Easy Writer',
          user_id: userId,
        },
      })
    }
    const chat = await service.chat.initialize({
      userId,
      plan,
      name: params.subject,
      modelId: model.parent_id ?? model.id,
      groupId: easyWriterGroup.id,
    })
    if (!chat.settings) {
      throw new NotFoundError({
        code: 'UNABLE_TO_CREATE_CHAT',
      })
    }
    await adapter.chatSettingsRepository.update({
      where: { id: chat.settings.id },
      data: {
        text: {
          update: {
            model: model.id,
            max_tokens: model.max_tokens,
            temperature: params.creativity,
          },
        },
      },
    })

    const userMessage = await service.message.storage.create({
      user,
      keyEncryptionKey,
      data: {
        data: {
          role: 'user',
          chat_id: chat.id,
          user_id: userId,
          disabled: false,
          content: prompt,
          full_content: prompt,
          platform: determinePlatform(Platform.WEB, !!employee?.enterprise_id),
        },
      },
    })

    service.chat.eventStream.emit({
      chat,
      event: {
        name: 'MESSAGE_CREATE',
        data: {
          message: userMessage,
        },
      },
    })

    let article: IArticle | null = null

    let generationStopped = false
    let closeStream$: (() => void) | null = null

    const textStream$ = from(articlePlan).pipe(
      concatMap((chapter, chapterIndex) => {
        if (generationStopped) {
          return EMPTY
        }

        const promiseObservable = (async () => {
          const chapterPrompt = getGenerateArticleChapterPrompt({
            language,
            chapter: chapter,
            generatedContent: article?.content ?? '',
            symbolsCount: params.symbolsCount,
            linkStyle: params.linkStyle,
            keywords: params.keywords,
          })

          const chapterMessage = await service.message.storage.create({
            user,
            keyEncryptionKey,
            data: {
              data: {
                role: 'user',
                chat_id: chat.id,
                user_id: userId,
                disabled: false,
                content: chapterPrompt,
                platform: determinePlatform(Platform.WEB, !!employee?.enterprise_id),
              },
            },
          })

          service.chat.eventStream.emit({
            chat,
            event: {
              name: 'MESSAGE_CREATE',
              data: {
                message: chapterMessage,
              },
            },
          })

          const chapterStream$ = await service.message.text.sendByProvider({
            providerId: null,
            user,
            model,
            messages: [chapterMessage],
            settings: {
              temperature: params.creativity,
              system_prompt: prompt,
              max_tokens: model.max_tokens,
            },
            planType: subscription?.plan?.type ?? null,
          })

          const { responseStream$, closeStream } = await handleResponseStreamWithChat({
            user,
            keyEncryptionKey,
            chat,
            model,
            prompt,
            subscription,
            employee,
            textStream$: chapterStream$,
            additionalCaps: chapterIndex === articlePlan.length - 1 ? constantCost : 0,
            isAdmin,
            developerKeyId,
          })
          closeStream$ = closeStream

          return responseStream$
        })()

        return from(promiseObservable).pipe(
          switchMap((data) => data),
          concatMap(async (data) => {
            if (data.status === 'done' && data.spentCaps !== null) {
              totalSpentCaps += data.spentCaps

              if (!article) {
                article = await adapter.articleRepository.create({
                  data: {
                    user_id: userId,
                    model_id: model.id,

                    generationMode: params.generationMode,
                    subject: params.subject,
                    plan: params.plan,
                    creativity: params.creativity,

                    style: params.style,
                    customStyle: customStyle,
                    linkStyle: params.linkStyle,
                    language,
                    symbolsCount: params.symbolsCount,
                    keywords: params.keywords,
                    sourceContent: sourceContent,
                    sourceLink: sourceLink,

                    content: `${data.content}\n\n`,
                    spentCaps: totalSpentCaps,

                    chat_id: chat.id,
                  },
                })
              } else {
                article =
                  (await adapter.articleRepository.update({
                    where: { id: article.id },
                    data: {
                      content: `${article.content}${data.content}\n\n`,
                      spentCaps: totalSpentCaps,
                    },
                  })) ?? article
              }

              const isLastChapter = chapterIndex === articlePlan.length - 1

              if (article.keywords && isSEO) {
                const slug = await generateUniqueSlug(params.subject, adapter.articleRepository)

                article = await adapter.articleRepository.update({
                  where: { id: article.id },
                  data: {
                    slug,
                  },
                })

                const keywords = params.keywords
                  .split(';')
                  .map((kw) => kw.trim())
                  .filter(Boolean)

                const keywordTopicPairs =
                  await adapter.seoArticleTopicRepository.findByLocalizedKeywords({
                    keywords,
                    language,
                  })

                const uniqueKeywordCategoryPairs = new Map<
                  string,
                  {
                    name: { ru: string; en: string; es: string; fr: string; pt: string }
                    slug: string
                    category_id: string
                  }
                >()

                for (const pair of keywordTopicPairs) {
                  const nameObj = pair.name as { [key in IArticleLanguage]?: string } | null
                  if (!nameObj) continue
                  const keyword = nameObj[language]
                  if (!keyword) continue
                  const key = `${keyword}:${pair.category_id}`
                  if (!uniqueKeywordCategoryPairs.has(key)) {
                    uniqueKeywordCategoryPairs.set(key, pair)
                  }
                }

                const topicsToCreate = Array.from(uniqueKeywordCategoryPairs.values()).map(
                  ({ name, slug, category_id }) => ({
                    data: {
                      name,
                      slug,
                      category_id,
                      article_id: article!.id,
                    },
                  }),
                )

                if (topicsToCreate.length > 0) {
                  await adapter.seoArticleTopicRepository.createMany(topicsToCreate)
                }
              }
              return {
                status: isLastChapter ? ('done' as const) : ('chapterDone' as const),
                contentDelta: `${data.contentDelta}\n\n`,
                caps: data.caps,
                spentCaps: data.spentCaps,
                chatId: chat.id,
                articleId: article.id,
                slug: article.slug,
              }
            }

            return {
              status: data.status,
              contentDelta: data.contentDelta,
              caps: data.caps,
              spentCaps: data.spentCaps,
              chatId: chat.id,
              articleId: '',
            }
          }),
        )
      }),
    )

    const closeStream = () => {
      generationStopped = true
      if (closeStream$) {
        closeStream$()
      }
    }

    return {
      responseStream$: textStream$,
      closeStream,
    }
  }
}

export const generateUniqueSlug = async (subject: string, articleRepository: ArticleRepository) => {
  let slug = slugification(subject)
  let counter = 1
  while (await articleRepository.get({ where: { slug: `${slug}-${counter}` } })) {
    counter++
  }
  return `${slug}-${counter}`
}
