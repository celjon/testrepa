import { Platform } from '@prisma/client'
import { config } from '@/config'
import { clamp } from '@/lib'
import { IArticleLanguage } from '@/domain/entity/article'
import { CheckSourceMatch } from '@/domain/usecase/article/check-source-match'
import { GenerateSearchQueries } from '@/domain/usecase/article/generate-search-queries'
import { CompressSource } from '@/domain/usecase/article/compress-sources'
import { ExtractBibliography } from '@/domain/usecase/article/extract-bibliography'
import { UseCaseParams } from '../types'
import { GetChildModel } from './get-child-model'
import { logMemoryUsage } from '@/lib/logger'

type Params = UseCaseParams & {
  getChildModel: GetChildModel
  checkSourceMatch: CheckSourceMatch
  generateSearchQueries: GenerateSearchQueries
  compressSource: CompressSource
  extractBibliography: ExtractBibliography
}

export type AddSourcesWithPdf = (params: {
  userId: string
  subject: string
  plan: string
  language: IArticleLanguage
  symbolsCount: number
  isAdmin?: boolean
  developerKeyId?: string
}) => Promise<{ sources: string; spentCaps: number }>

type SourceBeforeDownload = { title: string; snippet: string; summary: string; resources: string[] }

const modelForSources = 'gpt-4o-mini'
export const buildAddSourcesWithPDF = ({
  adapter,
  service,
  getChildModel,
  checkSourceMatch,
  generateSearchQueries,
  compressSource,
  extractBibliography,
}: Params): AddSourcesWithPdf => {
  return async ({ userId, subject, plan, language, symbolsCount, isAdmin, developerKeyId }) => {
    const { model, subscription, employee } = await getChildModel({
      model_id: modelForSources,
      userId,
    })
    const model_id = modelForSources
    const pdfFilesCount = symbolsCount ? clamp(Math.round(symbolsCount / 2000), 3, 20) : 3
    let validSources: SourceBeforeDownload[] = []
    const seenLinks = new Set<string>()
    let totalCapsSpend: number = 0
    const fetchValidSources = async (query: string, boarder: number) => {
      let sources: SourceBeforeDownload[] = []
      let skipped = 0

      while (sources.length < pdfFilesCount) {
        const result = await adapter.googleScholarGateway.getGoogleScholarResultsWithPDF(
          { query, language: language, skip: skipped },
          pdfFilesCount,
        )
        skipped += result.skipped
        for (const src of result.results) {
          const { match, capsSpend } = await checkSourceMatch({
            title: src.title,
            snippet: src.snippet,
            subject,
            plan,
            userId,
            model_id,
          })
          if (capsSpend) totalCapsSpend += capsSpend
          if (match) sources.push(src)
          if (sources.length >= pdfFilesCount) break
        }
        if (result.results.length < pdfFilesCount || result.skipped > boarder) {
          break
        }
      }
      return sources
    }
    const compressSources = async (
      sources: {
        title: string
        text: string
        link: string
        meta: { info: string; metadata: string; summary: string }
      }[],
    ) => {
      return await Promise.all(
        sources.map(async (markdownSource) => {
          const { text, title, capsSpendCompressSource } = await compressSource({
            textSource: markdownSource,
            subject,
            plan,
            language,
            userId,
            model_id,
          })
          if (capsSpendCompressSource) totalCapsSpend += capsSpendCompressSource
          const { bibliographic, capsSpend } = await extractBibliography({
            textSource: markdownSource,
            language,
            userId,
            model_id,
          })
          if (capsSpend) totalCapsSpend += capsSpend
          if (text.length > 50 && bibliographic.author) {
            return { title, text, bibliographic, summary: markdownSource.meta.summary }
          } else {
            return undefined
          }
        }),
      )
    }
    const tryAddSource = (source: SourceBeforeDownload) => {
      if (source.resources.some((link) => seenLinks.has(link))) return
      source.resources.forEach((link) => seenLinks.add(link))
      validSources.push(source)
    }

    const now = performance.now()
    logMemoryUsage(`Start addingSourcesWithPDF, for subject: ${subject}`)
    let sources = await fetchValidSources(subject, 50)
    sources.forEach(tryAddSource)

    let markdownSources = await adapter.documentGateway.downloadPDFsAsMarkdown(validSources)
    let compressedSources = await compressSources(markdownSources)
    let filteredSources = compressedSources.filter((s): s is NonNullable<typeof s> => Boolean(s))

    if (filteredSources.length < pdfFilesCount) {
      validSources.length = 0
      const { queries, spentCaps } = await generateSearchQueries({
        subject,
        userId,
        language,
        model_id,
      })
      if (spentCaps) totalCapsSpend += spentCaps
      for (const q of queries) {
        if (validSources.length >= pdfFilesCount) break
        const sources = await fetchValidSources(q, 60)
        sources.forEach((source) => {
          if (validSources.length < pdfFilesCount) {
            tryAddSource(source)
          }
        })
        markdownSources = await adapter.documentGateway.downloadPDFsAsMarkdown(validSources)
        compressedSources = await compressSources(markdownSources)
        filteredSources = compressedSources.filter((s): s is NonNullable<typeof s> => Boolean(s))
      }
    }

    filteredSources.length = pdfFilesCount
    if (!isAdmin && subscription) {
      await service.subscription.writeOffWithLimitNotification({
        subscription,
        amount: totalCapsSpend,
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
    logMemoryUsage(`End addingSourcesWithPDF ${performance.now() - now}ms for subject: ${subject}`)

    return {
      sources: filteredSources
        .map((source, index) => {
          const bibliographic = Object.entries(source.bibliographic)
            .filter(([, value]) => value != null)
            .map(([key, value]) => `${key}: ${value}`)
            .join('\n')
          return `${source.title}\n${source.text}\n${bibliographic}\n[[${index + 1}]](${source.bibliographic.url})`
        })
        .join('\n'),
      spentCaps: totalCapsSpend,
    }
  }
}
