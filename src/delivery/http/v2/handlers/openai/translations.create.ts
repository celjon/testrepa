import { AuthRequest } from '../types'
import { Response } from 'express'
import { DeliveryParams } from '@/delivery/types'
import { Readable } from 'stream'

type Params = Pick<DeliveryParams, 'openai'>
export type TranslationsCreate = (req: AuthRequest, res: Response) => void

export const buildTranslationsCreate = ({ openai }: Params): TranslationsCreate => {
  return (req, res) => {
    return new Promise((resolve, reject) => {
      if (req.busboy) {
        const f = new Readable({})

        const body: any = {
          file: f
        }
        req.busboy.once('file', (_, file, info) => {
          body['fileName'] = info.filename
          file.on('data', (chunk) => {
            f.push(chunk)
          })
          file.on('end', () => {
            f.push(null)
          })
        })

        req.busboy.on('field', (name, value) => {
          if (name === 'temperature') {
            body[name] = parseFloat(value)
          } else {
            body[name] = value
          }
        })

        req.busboy.on('finish', async () => {
          try {
            const data = await openai.translations.create({
              userId: req.user?.id,
              params: body
            })
            res.status(200).json(data)
            resolve(null)
          } catch (e) {
            reject(e)
          }
        })

        req.pipe(req.busboy)
      } else {
        reject()
      }
    })
  }
}
