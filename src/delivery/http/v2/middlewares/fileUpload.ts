import { config as cfg } from '@/config'
import { randomUUID } from 'crypto'
import multer, { type Multer, StorageEngine } from 'multer'
import * as Minio from 'minio'
import { extname } from 'path'
import mime from 'mime-types'
import iconv from 'iconv-lite'
import { buffer as toBuffer } from 'stream/consumers'
import { ForbiddenError } from '@/domain/errors'

const isTextBuffer = (buffer: Buffer) => {
  const text = buffer.toString('utf-8')

  for (let i = 0; i < text.length; i++) {
    const charCode = text.charCodeAt(i)

    if (charCode < 32 && charCode !== 9 && charCode !== 10 && charCode !== 13) {
      return false
    }
  }

  return true
}

export type FileUploadMiddleware = (params?: {
  saveFiles?: boolean
  maxSize?: number
  getMaxSizeInBytes?: (req: any, fileType: string) => number
}) => Multer

export const buildFileUploadMiddleware = (): FileUploadMiddleware => {
  return ({ saveFiles = true, maxSize = cfg.upload_constraints.max_text_file_size, getMaxSizeInBytes } = {}) => {
    const bucket = 'bothub-storage'
    const { max_image_file_size, max_video_file_size } = cfg.upload_constraints

    const minioClient = new Minio.Client({
      endPoint: cfg.minio.host,
      port: cfg.minio.port || undefined,
      accessKey: cfg.minio.access_key,
      secretKey: cfg.minio.secret_key
    })

    const minioStorage: StorageEngine = {
      _handleFile: async (req, file, cb) => {
        let path: string
        if (file.originalname.match(/.png$/i) || file.originalname.match(/.jpg$/i) || file.originalname.match(/.jpeg$/i)) {
          path = `${cfg.minio.instance_folder}/images/${randomUUID()}${extname(file.originalname)}`
        } else {
          path = `${cfg.minio.instance_folder}/files/${randomUUID()}${extname(file.originalname)}`
        }

        const type = mime.lookup(path)
        const originalname = iconv.decode(Buffer.from(file.originalname, 'binary'), 'utf8')
        const originalExtname = extname(originalname)

        try {
          const buffer = await toBuffer(file.stream)
          const fileExtNames = /jpeg|jpg|png|svg|docx|xlsx|pdf|flac|m4a|mp3|mp4|mpeg|mpga|oga|ogg|wav|webm|avi|wmv/i

          let finalMaxSize = maxSize

          if (getMaxSizeInBytes) {
            finalMaxSize = getMaxSizeInBytes(req, originalExtname.toLowerCase())
          } else {
            if (buffer.length === 0 || !(fileExtNames.test(originalExtname.toLowerCase()) || isTextBuffer(buffer))) {
              const size = buffer.byteLength

              if (size > finalMaxSize) {
                throw new ForbiddenError({
                  code: 'FILE_TOO_LARGE',
                  httpStatus: 413,
                  message: `The uploaded file must not exceed ${finalMaxSize} bytes`
                })
              }

              return cb(null, { path, size, originalname })
            }

            if (/jpeg|jpg|png/i.test(originalExtname)) {
              finalMaxSize = max_image_file_size
            } else if (/flac|m4a|mp3|mp4|mpeg|mpga|oga|ogg|wav|webm|avi|wmv/i.test(originalExtname)) {
              finalMaxSize = max_video_file_size
            }
          }

          const size = buffer.byteLength

          if (size > finalMaxSize) {
            throw new ForbiddenError({
              code: 'FILE_TOO_LARGE',
              httpStatus: 413,
              message: `The uploaded file must not exceed ${finalMaxSize} bytes`
            })
          }

          if (saveFiles) {
            await minioClient.putObject(bucket, path, buffer, undefined, {
              'Cache-Control': 'public, max-age=31536000, immutable',
              ...(type && {
                'Content-Type': type,
              })
            })

            return cb(null, { path, size, originalname, buffer })
          } else {
            return cb(null, { size, originalname, buffer })
          }
        } catch (error) {
          if (error instanceof Error) {
            cb(error)
          } else {
            throw error
          }
        }
      },
      _removeFile: async (req, file, cb) => {
        try {
          await minioClient.removeObject(bucket, file.path)

          cb(null)
        } catch (error) {
          if (error instanceof Error) {
            cb(error)
          } else {
            throw error
          }
        }
      }
    }

    return multer({
      storage: minioStorage
    })
  }
}
