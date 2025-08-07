import { NextFunction, Request, Response } from 'express'
import { DeliveryParams } from '@/delivery/types'
import { AuthRequest } from '../types'
import { getFiles, setSSEHeaders } from '@/lib'
import { logger } from '@/lib/logger'
import { Middlewares } from '../../middlewares'

export const buildGenerateArticleMiddleware = ({ fileUpload }: Middlewares) => {
  const webFilesMiddleware = fileUpload({ saveFiles: false }).fields([
    {
      name: 'sourceFile',
      maxCount: 1,
    },
    {
      name: 'customStyleFile',
      maxCount: 1,
    },
  ])

  return (req: Request, res: Response, next: NextFunction) => {
    return webFilesMiddleware(req, res, next)
  }
}

type Params = Pick<DeliveryParams, 'article'>

export type GenerateArticle = (req: AuthRequest, res: Response) => Promise<void>

export const buildGenerateArticle = ({ article }: Params): GenerateArticle => {
  return async (req, res) => {
    const sourceFiles = getFiles(req, 'sourceFile')
    const customStyleFiles = getFiles(req, 'customStyleFile')

    const { responseStream$, closeStream } = await article.generateArticle({
      userId: req.user?.id,
      keyEncryptionKey: req.user?.keyEncryptionKey,

      spentCaps: Number(req.body.spentCaps),
      generationMode: req.body.generationMode,
      subject: req.body.subject,
      plan: req.body.plan,
      creativity: Number(req.body.creativity),

      style: req.body.style,
      customStyle: req.body.customStyle,
      customStyleFile: customStyleFiles.length > 0 ? customStyleFiles[0] : undefined,

      model_id: req.body.model_id,
      language: req.body.language,
      linkStyle: req.body.linkStyle,
      symbolsCount: Number(req.body.symbolsCount),
      keywords: req.body.keywords,
      sourceFile: sourceFiles.length > 0 ? sourceFiles[0] : undefined,
      sourceLink: req.body.sourceLink,
      developerKeyId: req.user.developerKeyId,
    })

    setSSEHeaders(res)
    const subscription = responseStream$.subscribe({
      next: async (asyncData) => {
        const data = asyncData
        res.write(`data: ${JSON.stringify(data)}\n\n`)

        if (data.status === 'done') {
          res.write('[DONE]')
          res.end()
        }
      },
      error: (error) => {
        res.write(`error: ${error?.message || 'unknown'}\n`)
        res.write(`data: ${JSON.stringify(error)}\n\n`)
        res.write('[DONE]')
        res.end()
      },
    })

    req.on('error', () => {
      logger.warn({
        location: 'article.generateArticle',
        message: 'Unexpected sse connection error',
      })
    })

    req.socket.on('close', () => {
      closeStream()
      subscription.unsubscribe()
    })
  }
}
