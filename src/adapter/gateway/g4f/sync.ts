import { AdapterParams } from '@/adapter/types'
import { IMessage } from '@/domain/entity/message'
import { IChatTextSettings } from '@/domain/entity/chat-settings'
import { BaseError, InternalError } from '@/domain/errors'
import { APIError } from 'openai'
import {
  ChatCompletion,
  ChatCompletionCreateParamsNonStreaming,
  ChatCompletionMessageToolCall,
  ChatCompletionTool,
  ChatCompletionToolChoiceOption,
} from 'openai/resources'
import { config } from '@/config'
import { buildTokenizeG4F } from './send'
import { ModelUsage } from '../types'

const allowedSettings = [
  'temperature',
  'presence_penalty',
  'max_tokens',
  'top_p',
  'frequency_penalty',
]

type Message = {
  role: string
  content: string
  reasoning_content: string | null
}

type G4FChatCompletion = ChatCompletion & {
  conversation: {
    conversation_id: string
    message_id: string
  }
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
  usage: ModelUsage
  tool_calls?: ChatCompletionMessageToolCall[]
  conversation: {
    conversation_id: string
    message_id: string
  }
}>

export const buildSync = ({ g4f }: Params): Sync => {
  const tokenize = buildTokenizeG4F()

  return async ({ apiUrl, messages, settings, tools, tool_choice, endUserId, provider }) => {
    try {
      const { model } = settings

      const g4fClient = g4f.client.create({
        apiUrl,
        harManagerUrl: config.model_providers.g4f.har_manager_url,
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
            content: settings.system_prompt ?? '',
          },
          ...messages.map((message) => ({
            content: message.content ?? '',
            role: message.role as 'assistant' | 'user',
          })),
        ],
        ...clearedSettings,
        user: endUserId,
        provider,
      }

      const [completion, prompt_tokens] = await Promise.all([
        g4fClient.chat.completions.create(createCompletionParams),
        tokenize({
          modelId: model,
          messages,
          settings: settings,
        }),
      ])

      const result = completion?.choices[0]?.message
      const message: Message = {
        role: result.role,
        content: result.content ?? '',
        reasoning_content:
          (
            result as unknown as {
              reasoning_content: string | null
            }
          ).reasoning_content ?? null,
      }

      const completion_tokens = await tokenize({
        modelId: model,
        messages: [
          {
            role: 'assistant',
            content: `${message.content}${message.reasoning_content ?? ''}`,
          },
        ],
      })

      return {
        message,
        response: message,
        tool_calls: result.tool_calls,
        usage: {
          completion_tokens,
          prompt_tokens,
          total_tokens: prompt_tokens + completion_tokens,
        },
        conversation: {
          conversation_id: (completion as G4FChatCompletion).conversation.conversation_id,
          message_id: (completion as G4FChatCompletion).conversation.message_id,
        },
      }
    } catch (error) {
      if (error.error?.message?.includes('NoValidHarFileError:')) {
        throw new InternalError({
          code: 'G4F_NO_VALID_HAR_FILE',
          message: error.error?.message,
        })
      } else if (error.error?.message?.includes('MissingAuthError')) {
        throw new InternalError({
          code: 'G4F_NO_VALID_ACCESS_TOKEN',
          message: error.error?.message,
        })
      }

      if (error instanceof APIError) {
        throw new BaseError({
          httpStatus: error.status,
          message: error.message,
          code: error.code ?? undefined,
        })
      }

      throw error
    }
  }
}
