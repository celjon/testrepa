import { NextFunction, Request, Response } from 'express'
import { DeliveryParams } from '@/delivery/types'
import { AuthRequest } from '../types'
import { getFiles, getLocale } from '@/lib'
import { Middlewares } from '@/delivery/http/v2/middlewares'
import * as XLSX from 'xlsx'

export const buildBatchGenerateArticlesMiddleware = ({ fileUpload }: Middlewares) => {
  const webFilesMiddleware = fileUpload({ saveFiles: false }).fields([
    {
      name: 'articlesParams',
      maxCount: 1
    }
  ])

  return (req: Request, res: Response, next: NextFunction) => {
    return webFilesMiddleware(req, res, next)
  }
}

type Params = Pick<DeliveryParams, 'article'>

export type BatchGenerateArticles = (req: AuthRequest, res: Response) => Promise<Response>

export const buildBatchGenerateArticles = ({ article }: Params): BatchGenerateArticles => {
  return async (req, res) => {
    const locale = getLocale(req.headers['accept-language'])
    const file = getFiles(req, 'articlesParams')[0]
    if (!file || !file.buffer) {
      return res.status(400).json({ error: 'XLSX file is required (field "articlesParams")' })
    }
    const userId = req.user?.id
    const keyEncryptionKey = req.user?.keyEncryptionKey

    try {
      const workbook = XLSX.read(file.buffer, { type: 'buffer' })
      const firstSheetName = workbook.SheetNames[0]
      const sheet = workbook.Sheets[firstSheetName]

      const records = XLSX.utils.sheet_to_json(sheet)

      const parsedArticles = records.map((article: any) => ({
        userId,
        keyEncryptionKey,

        generationMode: article.generationMode,
        subject: article.subject,
        creativity: Number(article.creativity ?? 0.5),
        style: article.style,

        model_id: article.model_id,
        language: article.language,
        linkStyle: article.linkStyle,
        symbolsCount: Number(article.symbolsCount),
        keywords: article.keywords ?? '',
        isSEO: article.isSEO ?? false
      }))

      //DONT AWAIT THIS
      article.batchGenerateArticles({
        articles: parsedArticles,
        email: req.body.email,
        locale
      })

      return res.status(200).json({
        message:
          'After the generation is completed, an email with links to the generated articles will be sent to the email address you specified.'
      })
    } catch (error) {
      return res.status(500).json({ error: 'Failed to process CSV file', details: error.message })
    }
  }
}
