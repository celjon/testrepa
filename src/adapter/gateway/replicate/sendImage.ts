import { FileOutput } from 'replicate'
import { AdapterParams } from '@/adapter/types'
import { IChatReplicateImageSettings } from '@/domain/entity/chatSettings'
import { IMessage } from '@/domain/entity/message'
import { IModel } from '@/domain/entity/model'
import { AspectRatio, aspectRatios, FluxProAspectRatio, fluxProAspectRatios, ImageFormat, imageFormats } from './types'
import { extname } from 'path'

type Params = Pick<AdapterParams, 'replicate'>

type Image = {
  base64: string
  buffer: Buffer
  ext: string
}

type IChatFluxProSettings = {
  aspect_ratio: FluxProAspectRatio

  steps: number // 1..50
  guidance: number // 2..5
  interval: number // 1..4

  seed: number // int
  output_format: ImageFormat
  output_quality: number // int 0..100
}

type IChatFluxDevSettings = {
  aspect_ratio: AspectRatio
  image: string

  num_inference_steps: number // 1..50
  guidance: number // 0..10
  prompt_strength: number // 0..1
  num_outputs: number // 1..4

  seed: number // int
  output_format: ImageFormat
  output_quality: number // int 0..100
}

type IChatFluxSchnellSettings = {
  aspect_ratio: AspectRatio
  num_outputs: number // 1..4

  seed: number // int
  output_format: ImageFormat
  output_quality: number // int 0..100
}

type IChatSD3Settings = {
  aspect_ratio: AspectRatio

  image: string
  steps: number // 1..28
  cfg: number // 0..20
  prompt_strength: number // 0..1

  seed: number // int
  output_format: ImageFormat
  output_quality: number // int 0..100

  negative_prompt: string
}

export type SendImage = (params: { message: IMessage; settings: Partial<IChatReplicateImageSettings>; model: IModel }) => Promise<Image[]>

export const buildSendImage = ({ replicate }: Params): SendImage => {
  return async ({ message, settings, model }) => {
    let replicateSettings = null
    if (model.id === 'flux-pro' || model.id === 'flux-1.1-pro') {
      replicateSettings = {
        aspect_ratio: getAspectRatio(fluxProAspectRatios, settings.aspect_ratio),
        steps: settings.steps,
        guidance: settings.guidance,
        interval: settings.interval,
        seed: settings.seed,
        output_format: getOutputFormat(settings.output_format),
        output_quality: settings.output_quality
      } satisfies Partial<IChatFluxProSettings>
    } else if (model.id === 'flux-dev') {
      replicateSettings = {
        aspect_ratio: getAspectRatio(aspectRatios, settings.aspect_ratio),
        num_inference_steps: settings.steps,
        guidance: settings.guidance,
        prompt_strength: settings.prompt_strength,
        num_outputs: settings.num_outputs,
        seed: settings.seed,
        output_format: getOutputFormat(settings.output_format),
        output_quality: settings.output_quality
      } satisfies Partial<IChatFluxDevSettings>
    } else if (model.id === 'flux-schnell') {
      replicateSettings = {
        aspect_ratio: getAspectRatio(aspectRatios, settings.aspect_ratio),
        num_outputs: settings.num_outputs,
        seed: settings.seed,
        output_format: getOutputFormat(settings.output_format),
        output_quality: settings.output_quality
      } satisfies Partial<IChatFluxSchnellSettings>
    } else if (model.id === 'stable-diffusion-3') {
      replicateSettings = {
        aspect_ratio: getAspectRatio(aspectRatios, settings.aspect_ratio),
        steps: settings.steps,
        cfg: settings.guidance,
        prompt_strength: settings.prompt_strength,
        seed: settings.seed,
        output_format: getOutputFormat(settings.output_format),
        output_quality: settings.output_quality,
        negative_prompt: settings.negative_prompt
      } satisfies Partial<IChatSD3Settings>
    } else {
      replicateSettings = {
        ...settings,
      }
    }
    if (replicateSettings.seed === 0) {
      delete replicateSettings.seed
    }

    const output = await replicate.client.run(`${model.prefix as `${string}/`}${model.id}`, {
      input: {
        ...replicateSettings,
        prompt: message.content
      },
      wait: {
        mode: 'block'
      }
    })

    const imagesOutput: FileOutput[] = []
    if (Array.isArray(output)) {
      for (const outputItem of output) {
        imagesOutput.push(outputItem)
      }
    } else if (output instanceof ReadableStream) {
      imagesOutput.push(output as FileOutput)
    }

    const images: Image[] = await Promise.all(
      imagesOutput.map(async (image) => {
        const arrayBuffer = await image.blob().then((blob) => blob.arrayBuffer())
        const base64 = Buffer.from(arrayBuffer).toString('base64')
        const ext = extname(image.url().pathname).slice(1) ?? settings.output_format ?? 'png'

        return {
          base64,
          buffer: Buffer.from(arrayBuffer),
          ext: `.${ext}`
        }
      })
    )

    return images
  }
}

const getAspectRatio = <T extends string>(aspectRatios: readonly T[], aspectRatio?: string): T => {
  if (includes(aspectRatios, aspectRatio)) {
    return aspectRatio
  }

  return aspectRatios[0]
}

const getOutputFormat = (outputFormat?: string): ImageFormat => {
  if (includes<ImageFormat>(imageFormats, outputFormat)) {
    return outputFormat
  }

  return imageFormats[0]
}

const includes = <T extends string>(array: readonly T[], value?: string): value is T => {
  return array.includes((value || '') as T)
}
