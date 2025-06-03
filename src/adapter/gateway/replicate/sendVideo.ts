import { FileOutput } from 'replicate'
import { IMessage } from '@/domain/entity/message'
import { IModel } from '@/domain/entity/model'
import { extname } from 'path'
import { AdapterParams } from '@/adapter/types'
import { getFileURL } from '@/domain/entity/file'
import { IChatVideoSettings } from '@/domain/entity/chatSettings'

type Params = Pick<AdapterParams, 'replicate'>
export type Video = {
  buffer: Buffer
  ext: string
}

export type SendVideo = (params: { message: IMessage; model: IModel; settings: Partial<IChatVideoSettings> }) => Promise<Video>

export const buildSendVideo = ({ replicate }: Params): SendVideo => {
  return async ({ message, model, settings }) => {
    const input = {
      prompt: message.content,
      duration: settings.duration_seconds ?? 5,
      aspect_ratio: settings.aspect_ratio ?? '16:9',
      image: message.images?.length === 1 && message.images[0]?.original ? getFileURL(message.images[0].original).toString() : undefined
    }
    const output = await replicate.client.run(`${model.prefix as `${string}/`}${model.id}`, {
      input,
      wait: { mode: 'block' }
    })
    if (!output || typeof output !== 'object' || !(output as FileOutput).blob) {
      throw new Error('Invalid output from Replicate')
    }

    const fileOutput = output as FileOutput
    const arrayBuffer = await fileOutput.blob().then((blob) => blob.arrayBuffer())
    const buffer = Buffer.from(arrayBuffer)
    const ext = extname(fileOutput.url().pathname).slice(1) || 'mp4'

    return { buffer, ext: `.${ext}` }
  }
}
