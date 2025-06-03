import { MessageStatus, SearchStatus } from '@prisma/client'
import { Adapter } from '@/domain/types'
import { ISearchResult } from '@/domain/entity/message'
import { ChatService } from '@/domain/service/chat'
import { AIToolsService } from '@/domain/service/ai-tools'
import { MessageStorage } from '../../storage/types'
import { LLMPluginParams, LLMPluginResult } from '../types'

type Params = Pick<Adapter, 'webSearchGateway' | 'openrouterGateway' | 'modelRepository'> & {
  messageStorage: MessageStorage
  chatService: ChatService
  aiToolsService: AIToolsService
}

export type PerformWebSearch = (
  params: Pick<LLMPluginParams, 'model' | 'settings' | 'prompt' | 'user' | 'keyEncryptionKey' | 'chatId' | 'assistantMessage' | 'locale'>
) => LLMPluginResult

export const buildPerformWebSearch = ({ messageStorage, chatService, aiToolsService }: Params): PerformWebSearch => {
  return async ({ model, settings, prompt, user, keyEncryptionKey, chatId, assistantMessage, locale = 'ru' }) => {
    if (!settings || !settings.text || !settings.text.enable_web_search) {
      return {
        promptAddition: '',
        systemPromptAddition: '',
        caps: 0
      }
    }

    const messages = await messageStorage.list({
      user,
      keyEncryptionKey,
      data: {
        where: {
          status: MessageStatus.DONE,
          chat_id: chatId,
          content: {
            not: null
          },
          disabled: false,
          choiced: true
        },
        orderBy: {
          created_at: 'asc'
        },
        include: {
          images: {
            include: {
              original: true
            }
          }
        }
      }
    })

    return aiToolsService.performWebSearch({
      userId: user.id,
      model,
      prompt,
      messages: messages.slice(0, -1).map((m) => ({
        role: m.role,
        content: m.full_content ?? m.content ?? ''
      })),
      locale,
      onQueriesGenerated: async () => {
        if (assistantMessage) {
          chatService.eventStream.emit({
            chatId,
            event: {
              name: 'MESSAGE_UPDATE',
              data: {
                message: {
                  id: assistantMessage.id,
                  search_status: SearchStatus.SEARCHING
                }
              }
            }
          })
        }
      },
      onResultsLoaded: async ({ sources }) => {
        if (assistantMessage) {
          const searchResultsToSave: ISearchResult[] = sources.map((source) => ({
            url: source.url,
            title: source.title,
            snippet: source.snippet
          }))

          chatService.eventStream.emit({
            chatId,
            event: {
              name: 'MESSAGE_UPDATE',
              data: {
                message: {
                  id: assistantMessage.id,
                  search_status: SearchStatus.DONE,
                  search_results: searchResultsToSave
                }
              }
            }
          })

          await messageStorage.update({
            user,
            keyEncryptionKey,
            data: {
              where: {
                id: assistantMessage.id
              },
              data: {
                search_status: SearchStatus.DONE,
                search_results: searchResultsToSave
              }
            }
          })
        }
      }
    })
  }
}
