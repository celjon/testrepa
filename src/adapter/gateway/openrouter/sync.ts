import { APIError } from 'openai'
import {
  ChatCompletionCreateParamsNonStreaming,
  ChatCompletionMessageParam,
  ChatCompletionMessageToolCall,
  ChatCompletionTool,
  ChatCompletionToolChoiceOption
} from 'openai/resources'
import { AdapterParams } from '@/adapter/types'
import { logger } from '@/lib/logger'
import { getErrorString } from '@/lib'
import { ModelUsage } from '../types'
import { IChatSettings } from '@/domain/entity/chatSettings'
import { BaseError } from '@/domain/errors'

const allowedSettings = ['temperature', 'presence_penalty', 'max_tokens', 'top_p', 'frequency_penalty']

type Message = {
  role: string
  content: string
}

type Params = Pick<AdapterParams, 'openRouterBalancer'>

/* 
Array<{
  role: 'user';
  content: string | Array<{
    type: 'text';
    text: string;
  } | {
    type: 'image_url';
    image_url: {
      url: string;
    };
  }>;
}> | Array<{
  role: 'assistant';
  content: string | Array<({
    type: 'text';
    text: string;
  })>;
}> | Array<{
  role: 'tool',
  content: string | Array<{
    type: 'text';
    text: string;
  }>,
  tool_call_id: string;
}> */

export type Sync = (params: {
  messages: Array<ChatCompletionMessageParam>
  tools?: ChatCompletionTool[]
  tool_choice?: ChatCompletionToolChoiceOption
  settings: Partial<IChatSettings> & {
    model: string
    system_prompt?: string
    temperature?: number
    top_p?: number
    max_tokens?: number
  }
  endUserId?: string
  provider?: {
    order?: string[]
  }
  response_format?: ChatCompletionCreateParamsNonStreaming['response_format']
  [key: string]: unknown
}) => Promise<{
  message: Message
  usage: ModelUsage | null
  tool_calls?: ChatCompletionMessageToolCall[]
}>

export const buildSync = (params: Params): Sync => {
  return async ({ messages, settings, tools, tool_choice, endUserId, provider, ...otherParams }) => {
    try {
      const { model } = settings
      const openRouterProvider = params.openRouterBalancer.next()
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

      const createCompletionParams: ChatCompletionCreateParamsNonStreaming & {
        provider?: {
          order?: string[]
        }
        transforms: Array<string>
      } = {
        model,
        tool_choice,
        tools,
        messages: [
          {
            role: 'system',
            content: settings.system_prompt ?? ''
          },
          ...messages
        ],
        ...clearedSettings,
        user: endUserId,
        provider,
        transforms: ['middle-out'],
        ...otherParams
      }
      const completion = await openRouterProvider.client.chat.completions.create(createCompletionParams)

      if (!completion.choices || completion.choices.length === 0) {
        throw new Error(`Completion error: ${JSON.stringify(completion)}`)
      }

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
          location: 'openrouterGateway.sync',
          message: getErrorString(error),
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
