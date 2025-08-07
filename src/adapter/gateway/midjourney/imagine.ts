import { IMessage } from '@/domain/entity/message'
import { NotFoundError } from '@/domain/errors'
import { MidjourneyImagineResult, newMidjourneyApi } from '@/lib/clients/midjourney-api'
import { IChatMidjourneySettings } from '@/domain/entity/chat-settings'
import { getFileURL } from '@/domain/entity/file'
import { MidjourneyMode } from '@prisma/client'
import { withTimeout } from '@/lib'
import { config as projectConfig } from '@/config/config'
import { MjConfig } from '@/domain/service/message/midjourney/process-mj'
import { reorderParameters } from './reorder-parameters'

export type Imagine = (params: {
  config: MjConfig
  message: IMessage
  settings: Partial<IChatMidjourneySettings>
  callback: (params: { url?: string; progress: string }) => void
}) => Promise<(MidjourneyImagineResult & { accountId: string }) | null>

export const buildImagine = (): Imagine => {
  return async ({ config, message, settings, callback }) => {
    const { client } = newMidjourneyApi(config)

    if (!client)
      throw new NotFoundError({
        code: 'MIDJOURNEY_ACCOUNT_NOT_FOUND',
        message: `Midjourney account ${config.accountId} not found`,
      })

    let promptImages: string[]

    if (message.images) {
      promptImages = message.images
        .map((messageImage) =>
          messageImage.original ? getFileURL(messageImage.original).toString() : null,
        )
        .filter((fileUrl) => fileUrl !== null) as string[]
    } else {
      promptImages = []
    }

    const userPrompt = reorderParameters(message.content ?? '')

    const parameters: Record<string, string | number | boolean> = {}

    if (settings.aspect && settings.aspect !== '1:1') {
      parameters['aspect'] = settings.aspect
    }
    if (settings.chaos) {
      parameters['chaos'] = settings.chaos
    }
    if (settings.no) {
      parameters['no'] = settings.no
    }
    if (typeof settings.quality === 'number' && settings.quality !== 1) {
      parameters['quality'] = settings.quality
    }
    if (typeof settings.stop === 'number' && settings.stop !== 100) {
      parameters['stop'] = settings.stop
    }
    if (settings.style && settings.style !== 'default') {
      parameters['style'] = settings.style
    }
    if (typeof settings.stylize === 'number' && settings.stylize !== 100) {
      parameters['stylize'] = settings.stylize
    }
    if (settings.tile) {
      parameters['tile'] = settings.tile
    }
    if (settings.weird) {
      parameters['weird'] = settings.weird
    }
    if (settings.mode) {
      switch (settings.mode) {
        case MidjourneyMode.RELAX:
          parameters['relax'] = true
          break
        case MidjourneyMode.FAST:
          parameters['fast'] = true
          break
        case MidjourneyMode.TURBO:
          parameters['turbo'] = true
          break
      }
    }
    if (settings.version) {
      parameters['version'] = settings.version
    }

    const promptParameters: string[] = []
    for (const parameterName of Object.keys(parameters)) {
      const parameterValue = parameters[parameterName]

      if (typeof parameterValue === 'boolean' && parameterValue) {
        promptParameters.push(`--${parameterName}`)
      } else {
        promptParameters.push(`--${parameterName} ${parameterValue}`)
        if ((parameterName === 'version' || parameterName === 'v') && parameterValue == 7) {
          promptParameters.push(`--p ${config.PersonalizationKey}`)
        }
      }
    }

    const promptParts: string[] = []

    if (promptImages.length !== 0) {
      promptParts.push(promptImages.join(' '))
    }
    if (userPrompt) {
      promptParts.push(
        userPrompt
          .replace(/^\/+/, '')
          .replace(/--relax/g, '')
          .replace(/--fast/g, '')
          .replace(/--turbo/g, '')
          .replace(/--v\s*\d+(\.\d+)?/g, '')
          .replace(/--version\s*\d+(\.\d+)?/g, '')
          .replace(/--p\s*[a-zA-Z0-9-]+/g, '')
          .replace(/--profile\s*[a-zA-Z0-9-]+/g, ''),
      )
    }
    if (promptParameters.length !== 0) {
      promptParts.push(promptParameters.join(' '))
    }

    const prompt: string = promptParts.join(' ')
    const timeout = prompt.includes('relax')
      ? projectConfig.timeouts.midjourney_imagine_relax
      : projectConfig.timeouts.midjourney_imagine_fast

    const result = await withTimeout(
      client.imagine({
        prompt,
        callback,
      }),
      timeout,
    )

    return result ? { ...result, accountId: config.accountId } : null
  }
}
