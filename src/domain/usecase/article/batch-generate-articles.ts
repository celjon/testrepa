import { UseCaseParams } from '../types'
import { runWithConcurrencyLimit } from '@/lib'
import { GenerateArticle } from './generate-article'
import { GeneratePlan } from './generate-plan'
import { IArticleLanguage, ValidArticleStyle } from '@/domain/entity/article'
import { ArticleLinkStyle, Role } from '@prisma/client'
import { filter, firstValueFrom, scan } from 'rxjs'
import { config } from '@/config'
import { NotFoundError } from '@/domain/errors'

type Params = UseCaseParams & {
  generateArticle: GenerateArticle
  generatePlan: GeneratePlan
}

export type BatchGenerateArticles = (params: {
  articles: {
    userId: string
    keyEncryptionKey: string | null

    generationMode: string
    subject: string
    creativity: number
    style: ValidArticleStyle

    model_id: string
    language: IArticleLanguage
    linkStyle: ArticleLinkStyle
    symbolsCount: number
    keywords: string
    isSEO: boolean
  }[]
  email: string
  locale: string
}) => Promise<void>

const poolLimit = 4
const batchSize = config.theSizeOfTheBundleForSendingGeneratedLinksToArticles

export const buildBatchGenerateArticles = ({ generateArticle, generatePlan, service, adapter }: Params): BatchGenerateArticles => {
  return async ({ articles, email, locale }) => {
    let batchLinks: string[] = []
    const user = await adapter.userRepository.get({
      where: {
        id: articles[0].userId
      }
    })

    if (!user) {
      throw new NotFoundError({
        code: 'USER_NOT_FOUND'
      })
    }

    const isAdmin = user.role === Role.ADMIN

    const sendBatch = async () => {
      if (batchLinks.length === 0) return
      try {
        await service.article.sendLinksToGeneratedArticles({
          email,
          articleLinks: batchLinks.join('\n'),
          locale
        })
        batchLinks = []
      } catch (error) {
        console.error(`Error sending article links: ${error}`)
      }
    }

    await runWithConcurrencyLimit(poolLimit, articles, async (params) => {
      try {
        const { responseStream$: planResponseStream$, closeStream: planCloseStream } = await generatePlan({
          userId: params.userId,
          locale: params.language,
          generationMode: params.generationMode,
          subject: params.subject,
          creativity: params.creativity,
          model_id: params.model_id,
          isAdmin
        })

        const finalPlanResult = await firstValueFrom(
          planResponseStream$.pipe(
            scan((acc, curr) => ({
              ...curr,
              contentDelta: acc.contentDelta + curr.contentDelta
            })),
            filter((val) => val.status === 'done')
          )
        )
        planCloseStream()
        const plan = finalPlanResult.contentDelta.trim()
        const { responseStream$: articleResponseStream$, closeStream: articleCloseStream } = await generateArticle({
          ...params,
          plan,
          isAdmin
        })

        const link = await new Promise<string>((resolve, reject) => {
          let articleId: string | null = null
          let slug: string | null = null
          const sub = articleResponseStream$.subscribe({
            next(data) {
              if (data.status === 'done' && data.articleId) {
                articleId = data.articleId
                slug = data.slug ?? null
              }
            },
            error(err) {
              console.error(`Error in article response stream: ${err}`)
              sub.unsubscribe()
              articleCloseStream()
              reject(err)
            },
            complete() {
              sub.unsubscribe()
              articleCloseStream()
              if (!articleId) {
                return reject(new Error('ArticleId not returned'))
              }
              const resultLink = slug ? `${config.http.real_address}seo-article/find-by-slug/${slug}` : articleId!
              resolve(resultLink)
            }
          })
        })

        batchLinks.push(link)
        if (batchLinks.length >= batchSize) {
          await sendBatch()
        }
        return link
      } catch (error) {
        console.error(`Error generating article or plan: ${error}`)
      }
    })

    await sendBatch()
  }
}
