import { logger } from '@/lib/logger'
import { BaseError, NotFoundError } from '@/domain/errors'
import { AxiosError } from 'axios'
import { MidjourneyButtonResult, newMidjourneyApi } from '@/lib/clients/midjourney-api'

export type Button = (params: {
  config: {
    accountId: string
    SalaiToken: string
    ServerId: string
    ChannelId: string
  }
  messageId: string
  button: string
  content?: string
  flags?: number
  callback: (params: { url?: string; progress: string }) => Promise<void>
}) => Promise<(MidjourneyButtonResult & { accountId: string }) | null>

export const buildButton = (): Button => {
  return async ({ config, messageId, button, content, flags, callback }) => {
    try {
      const { client } = newMidjourneyApi(config)

      if (!client)
        throw new NotFoundError({
          code: 'MIDJOURNEY_ACCOUNT_NOT_FOUND'
        })

      const result = await client.buttonClick({
        msgId: messageId,
        customId: button,
        content,
        flags,
        callback
      })

      return result ? { ...result, accountId: config.accountId } : null
    } catch (error) {
      if (error instanceof AxiosError) {
        if (error.response) {
          logger.log({
            level: 'error',
            location: 'midjourney.button',
            message: `${JSON.stringify(error.response?.data)}`,
            meta: error
          })

          throw new BaseError({
            httpStatus: error.response.status,
            message: error.response?.data?.message,
            code: 'MIDJOURNEY_ERROR'
          })
        } else {
          logger.error({
            location: 'midjourney.button ',
            message: `${String(error)}`
          })
        }
      }

      throw error
    }
  }
}
