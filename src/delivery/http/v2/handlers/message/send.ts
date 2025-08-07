import { Platform } from '@prisma/client'
import { DeliveryParams } from '@/delivery/types'
import { AuthRequest } from '../types'
import { NextFunction, Request, Response } from 'express'
import { getLocale } from '@/lib'
import { Middlewares } from '../../middlewares'
import { convertSentPlatform } from '@/domain/entity/action'
import { config } from '@/config'

const getMaxSizeInBytes = (req: any, fileType: string): number => {
  const { modelId } = req.body || {}

  const {
    max_image_file_size,
    max_video_file_size,
    max_text_file_size,
    max_assemblyai_file_size,
    max_runway_file_size,
  } = config.upload_constraints

  if (/jpeg|jpg|png/i.test(fileType)) {
    return modelId?.match(/^gen/) ? max_runway_file_size : max_image_file_size
  } else if (/flac|m4a|mp3|mp4|mpeg|mpga|oga|ogg|wav|webm|avi|wmv/i.test(fileType)) {
    return modelId?.match(/^assembly/) ? max_assemblyai_file_size : max_video_file_size
  } else {
    return max_text_file_size
  }
}

export const buildSendMiddleware = ({ fileUpload }: Middlewares) => {
  const webFilesMiddleware = fileUpload({
    saveFiles: false,
    getMaxSizeInBytes,
  }).fields([
    {
      name: 'files',
      maxCount: 100,
    },
    {
      name: 'audio',
      maxCount: 1,
    },
    {
      name: 'video',
      maxCount: 1,
    },
  ])

  const telegramFilesMiddleware = fileUpload({ saveFiles: false, getMaxSizeInBytes }).any()

  return (req: Request, res: Response, next: NextFunction) => {
    const { platform = Platform.WEB } = req.query

    if (typeof platform === 'string' && platform.toUpperCase() === Platform.TELEGRAM) {
      return telegramFilesMiddleware(req, res, next)
    }

    return webFilesMiddleware(req, res, next)
  }
}

type Params = Pick<DeliveryParams, 'message'>

export type Send = (req: AuthRequest, res: Response) => Promise<Response>

export const buildSend =
  ({ message }: Params): Send =>
  async (req, res) => {
    let files: Express.Multer.File[]
    let voiceFile: Express.Multer.File | null = null
    let videoFile: Express.Multer.File | null = null

    if (!req.files) {
      files = []
    } else if (Array.isArray(req.files)) {
      voiceFile = req.files.find((f) => f.fieldname === 'audio') ?? null
      videoFile = req.files.find((f) => f.fieldname === 'video') ?? null
      files = req.files.filter((f) => f.fieldname !== 'audio' && f.fieldname !== 'video')
    } else {
      files = req.files.files ?? []
      voiceFile = req.files.audio?.[0] ?? null
      videoFile = req.files.video?.[0] ?? null
    }

    const job = await message.send({
      userId: req.user?.id,
      keyEncryptionKey: req.user?.keyEncryptionKey,
      chatId: req.body.chatId,
      message: req.body.message ?? '',
      files,
      voiceFile,
      videoFile,
      platform: convertSentPlatform(req.query?.platform ?? req.body?.platform),
      locale: getLocale(req.headers['accept-language']),
      stream: req.body.stream ?? true,
      developerKeyId: req.user.developerKeyId,
    })

    return res.status(201).send(job)
  }
