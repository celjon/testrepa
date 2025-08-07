import { UseCaseParams } from '@/domain/usecase/types'
import { buildGenerateSubject, GenerateSubject } from './generate-subject'
import { buildGeneratePlan, GeneratePlan } from './generate-plan'
import { buildGenerateArticle, GenerateArticle } from './generate-article'
import { buildGeneratePlanHints, GeneratePlanHints } from './generate-plan-hints'
import { buildHandleResponseStreamWithChat } from './handle-response-stream-with-chat'
import { buildHandleResponseStream } from './handle-response-stream'
import { buildGetChildModel } from './get-child-model'
import { buildGetStructuredPlan } from './get-structured-plan'
import { buildGenerateChapter, GenerateChapter } from './generate-chapter'
import { buildGet, Get } from './get'
import { buildAddChapterToPlan, AddChapterToPlan } from './add-chapter-to-plan'
import { buildUpdate, Update } from './update'
import { buildAddSourcesWithPDF, AddSourcesWithPdf } from './add-sources-with-pdf'
import { buildExtractBibliography, ExtractBibliography } from './extract-bibliography'
import { buildCheckSourceMatch, CheckSourceMatch } from './check-source-match'
import { buildGenerateSearchQueries, GenerateSearchQueries } from './generate-search-queries'
import { buildCompressSource, CompressSource } from './compress-sources'
import { BatchGenerateArticles, buildBatchGenerateArticles } from './batch-generate-articles'
import { buildListSEOArticles, ListSEOArticles } from './list'
import {
  buildListSEOArticlesByCategorySlug,
  ListSEOArticlesByCategorySlug,
} from './list-by-category-slug'
import {
  buildListSEOArticlesByTopicSlug,
  ListSEOArticlesByTopicSlug,
} from './list-by-category-and-topic-slug'
import { buildDelete, Delete } from './delete'
import { buildFindBySlug, FindBySlug } from './find-by-slug'
import { buildDeleteMany, DeleteMany } from './delete-many'

export type ArticleUseCase = {
  generateSubject: GenerateSubject

  generatePlan: GeneratePlan
  generatePlanHints: GeneratePlanHints
  addChapterToPlan: AddChapterToPlan
  checkSourceMatch: CheckSourceMatch
  compressSource: CompressSource
  extractBibliography: ExtractBibliography
  addSourcesWithPDF: AddSourcesWithPdf

  generateArticle: GenerateArticle
  batchGenerateArticles: BatchGenerateArticles
  generateChapter: GenerateChapter
  generateSearchQueries: GenerateSearchQueries
  get: Get
  update: Update
  findBySlug: FindBySlug
  deleteArticle: Delete
  deleteMany: DeleteMany
  listSEOArticles: ListSEOArticles
  listSEOArticlesByCategorySlug: ListSEOArticlesByCategorySlug
  listSEOArticlesByTopicSlug: ListSEOArticlesByTopicSlug
}

export const buildArticleUseCase = (params: UseCaseParams): ArticleUseCase => {
  const getChildModel = buildGetChildModel(params)
  const getStructuredPlan = buildGetStructuredPlan(params)
  const handleResponseStream = buildHandleResponseStream(params)
  const handleResponseStreamWithChat = buildHandleResponseStreamWithChat(params)

  const generateSubject = buildGenerateSubject({
    ...params,
    handleResponseStream,
    getChildModel,
  })

  const generatePlan = buildGeneratePlan({
    ...params,
    handleResponseStream,
    getChildModel,
  })
  const generatePlanHints = buildGeneratePlanHints({
    ...params,
    getChildModel,
    handleResponseStream,
  })
  const addChapterToPlan = buildAddChapterToPlan({
    ...params,
    handleResponseStream,
    getChildModel,
  })

  const checkSourceMatch = buildCheckSourceMatch({
    ...params,
    getChildModel,
  })
  const generateSearchQueries = buildGenerateSearchQueries({
    ...params,
    getChildModel,
  })
  const compressSource = buildCompressSource({
    ...params,
    getChildModel,
  })
  const extractBibliography = buildExtractBibliography({
    ...params,
    getChildModel,
  })
  const addSourcesWithPDF = buildAddSourcesWithPDF({
    ...params,
    getChildModel,
    checkSourceMatch,
    generateSearchQueries,
    compressSource,
    extractBibliography,
  })

  const generateArticle = buildGenerateArticle({
    ...params,
    handleResponseStreamWithChat,
    getChildModel,
    getStructuredPlan,
    addSourcesWithPDF,
  })
  const batchGenerateArticles = buildBatchGenerateArticles({
    ...params,
    generateArticle,
    generatePlan,
  })

  const generateChapter = buildGenerateChapter({
    ...params,
    handleResponseStreamWithChat,
    getChildModel,
  })

  const get = buildGet(params)
  const update = buildUpdate(params)
  const findBySlug = buildFindBySlug(params)
  const deleteArticle = buildDelete(params)
  const deleteMany = buildDeleteMany(params)
  const listSEOArticles = buildListSEOArticles(params)
  const listSEOArticlesByCategorySlug = buildListSEOArticlesByCategorySlug(params)
  const listSEOArticlesByTopicSlug = buildListSEOArticlesByTopicSlug(params)

  return {
    generateSubject,

    generatePlan,
    generatePlanHints,
    addChapterToPlan,
    checkSourceMatch,
    compressSource,
    extractBibliography,
    addSourcesWithPDF,

    generateArticle,
    batchGenerateArticles,
    generateChapter,
    generateSearchQueries,
    get,
    update,
    findBySlug,
    deleteArticle,
    deleteMany,
    listSEOArticles,
    listSEOArticlesByCategorySlug,
    listSEOArticlesByTopicSlug,
  }
}
