import { AuthRequest } from '../types'
import { Response } from 'express'
import { DeliveryParams } from '@/delivery/types'
import { Readable } from 'stream'
import { InvalidDataError } from '@/domain/errors'

type Params = Pick<DeliveryParams, 'openai'>
export type TranscriptionsCreate = (req: AuthRequest, res: Response) => void

export const buildTranscriptionsCreate = ({ openai }: Params): TranscriptionsCreate => {
  return async (req, res) => {
    const files = Object.values(req.files ?? {})

    if (files.length === 0) {
      throw new InvalidDataError({
        httpStatus: 403,
        message: 'Audio file not transferred',
        code: 'FILE_NOT_TRANSFERRED'
      })
    }

    const userId = req.user.id
    const file = new Readable()
    const fileName = files[0].originalname || 'audio.wav'
    const model = req.body.model ?? 'whisper-1'

    file.push(files[0].buffer)
    file.push(null)

    const data = await openai.transcriptions.create({
      userId,
      params: {
        file,
        model,
        fileName,
        language: req.body.language,
        prompt: req.body.prompt,
        response_format: req.body.response_format,
        temperature: req.body.temperature,
        timestamp_granularities: req.body.timestamp_granularities
      }
    })

    return res.status(200).json(data)
  }
}
