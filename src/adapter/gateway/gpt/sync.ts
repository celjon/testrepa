import { AdapterParams } from '@/adapter/types'
import { logger } from '@/lib/logger'
import { IChatSettings } from '@/domain/entity/chatSettings'
import { BaseError } from '@/domain/errors'
import { APIError } from 'openai'
import { ChatCompletionMessageToolCall, ChatCompletionTool, ChatCompletionToolChoiceOption } from 'openai/resources'
import { ModelUsage } from '../types'

const allowedSettings = ['temperature', 'presence_penalty', 'max_tokens', 'top_p', 'frequency_penalty']

type Message = {
  role: string
  content: string
}

type Params = Pick<AdapterParams, 'openaiBalancer'>

export type Sync = (params: {
  messages: Array<{
    role: string
    content:
      | string
      | Array<
          | {
              type: 'text'
              text: string
            }
          | {
              type: 'image_url'
              image_url: {
                url: string
              }
            }
        >
  }>
  tools?: ChatCompletionTool[]
  tool_choice?: ChatCompletionToolChoiceOption
  settings: Partial<IChatSettings> & {
    model: string
    system_prompt?: string
  }
  endUserId: string
}) => Promise<{
  message: Message
  usage: ModelUsage | null
  tool_calls?: ChatCompletionMessageToolCall[] | undefined
}>

export const buildSync = (params: Params): Sync => {
  return async ({ messages, settings, tools, tool_choice, endUserId }) => {
    try {
      const { model } = settings
      const openaiProvider = params.openaiBalancer.next()
      const clearedSettings: Record<string, any> = {}

      for (let i = 0; i < allowedSettings.length; i++) {
        const key = allowedSettings[i]

        // @ts-ignore
        if (settings[key] == null || typeof settings[key] === 'undefined') {
          continue
        }

        // @ts-ignore
        clearedSettings[key] = settings[key]
      }

      const completion = await openaiProvider.client.chat.completions.create({
        model,
        tool_choice,
        tools,
        messages: [
          {
            role: 'system',
            content: settings.system_prompt ?? ''
          },
          ...messages.map((message) => ({
            content: message.content ?? '',
            role: message.role as 'user'
          }))
        ],
        ...clearedSettings,
        user: endUserId
      })

      const result = completion.choices[0].message
      const message: Message = {
        role: result.role,
        content: result.content ?? ''
      }

      return {
        message,
        response: message,
        tool_calls: result.tool_calls,
        usage: completion.usage ?? null
      }
    } catch (error) {
      if (error instanceof APIError) {
        logger.error({
          location: 'gptGateway.sync ',
          message: `${error.message}`,
          openaiKey: error.headers?.['Authorization']?.slice(0, 42)
        })

        throw new BaseError({
          httpStatus: error.status,
          message: error.message,
          code: error.code ?? undefined
        })
      }

      throw error
    }
  }
}
