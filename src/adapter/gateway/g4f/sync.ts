import { AdapterParams } from '@/adapter/types'
import { IMessage } from '@/domain/entity/message'
import { IChatTextSettings } from '@/domain/entity/chatSettings'
import { BaseError } from '@/domain/errors'
import { APIError } from 'openai'
import {
  ChatCompletionCreateParamsNonStreaming,
  ChatCompletionMessageToolCall,
  ChatCompletionTool,
  ChatCompletionToolChoiceOption
} from 'openai/resources'
import { config } from '@/config'
import { buildTokenizeG4F } from './send'

const allowedSettings = ['temperature', 'presence_penalty', 'max_tokens', 'top_p', 'frequency_penalty']

type Message = {
  role: string
  content: string
}

type Params = Pick<AdapterParams, 'g4f'>

export type Sync = (params: {
  apiUrl: string
  messages: Array<IMessage>
  tools?: ChatCompletionTool[]
  tool_choice?: ChatCompletionToolChoiceOption
  settings: Partial<IChatTextSettings> & {
    model: string
  }
  endUserId: string
  provider?: string
}) => Promise<{
  message: Message
  tokens: number
  tool_calls?: ChatCompletionMessageToolCall[]
}>

export const buildSync = ({ g4f }: Params): Sync => {
  const tokenize = buildTokenizeG4F()

  return async ({ apiUrl, messages, settings, tools, tool_choice, endUserId, provider }) => {
    try {
      const { model } = settings

      const g4fClient = g4f.client.create({
        apiUrl,
        harManagerUrl: config.model_providers.g4f.har_manager_url
      })

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
        provider?: string
      } = {
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
            role: message.role as 'assistant' | 'user'
          }))
        ],
        ...clearedSettings,
        user: endUserId,
        provider
      }

      const [completion, prompt_tokens] = await Promise.all([
        g4fClient.chat.completions.create(createCompletionParams),
        tokenize({
          modelId: model,
          messages,
          settings: settings
        })
      ])

      const result = completion.choices[0].message
      const message: Message = {
        role: result.role,
        content: result.content ?? ''
      }

      const completion_tokens = await tokenize({
        modelId: model,
        messages: [
          {
            role: 'assistant',
            content: completion.choices?.[0].message?.content ?? null
          }
        ]
      })

      const usedTokens = prompt_tokens + completion_tokens

      return {
        message,
        response: message,
        tool_calls: result.tool_calls,
        tokens: usedTokens
      }
    } catch (error) {
      if (error instanceof APIError) {
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
