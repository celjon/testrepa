import { config } from '@/config'
import { InvalidDataError } from '@/domain/errors'
import { Speech2TextService } from '@/domain/service/speech2text'
import { RawFile } from '@/domain/entity/file'
import { logger } from '@/lib/logger'
import { UseCaseParams } from '@/domain/usecase/types'
import { IMessage } from '@/domain/entity/message'
import { IntentAnalysisResponse } from '@/domain/service/intent/types'

export type AnalyzeIntentParams = {
  botSecretKey: string
  message?: string
  audioFile?: RawFile | null
  chatId?: string
  analyzeIntent?: boolean
  analyzeContext?: boolean
  analyzeComplexity?: boolean
}

export type DetermineIntent = (params: AnalyzeIntentParams) => Promise<IntentAnalysisResponse>

async function transcribeWithFallback(speech2TextService: Speech2TextService, audioFile: RawFile) {
  try {
    const { result } = await speech2TextService.transcribe({
      config: {
        model_id: 'assembly-ai-nano',
        mediaFile: audioFile,
        format_text: true,
      },
    })
    return result
  } catch (error) {
    logger.error('AssemblyAI failed, fallback to whisper-1', {
      error,
      location: 'intent.analyze.transcribeWithFallback',
    })
    try {
      const { result } = await speech2TextService.transcribe({
        config: {
          model_id: 'whisper-1',
          mediaFile: audioFile,
          format_text: true,
        },
      })
      return result
    } catch (error2) {
      logger.error('Both STT models failed', {
        assembly: error,
        whisper: error2,
        location: 'intent.analyze.transcribeWithFallback',
      })
      throw new InvalidDataError({
        code: 'STT_FAILED',
        message: 'Both speech-to-text models failed',
      })
    }
  }
}

async function getLastMessages(chatId: string, params: UseCaseParams): Promise<IMessage[]> {
  try {
    const messages = await params.adapter.messageRepository.list({
      where: {
        chat_id: chatId,
        disabled: false,
        role: {
          in: ['user', 'assistant'],
        },
      },
      orderBy: {
        created_at: 'desc',
      },
      take: 2,
    })

    if (messages.length === 0) {
      logger.info('Context analysis: no message history available yet', {
        chatId,
        location: 'intent.analyze.getLastMessages',
      })
      return []
    }

    const ordered = [...messages].reverse()
    const previewLines = ordered
      .map((m) => `${m.role.toUpperCase()}: ${(m.content || '').slice(0, 120)}`)
      .join('\n')

    logger.info(
      `Context analysis: fetched ${ordered.length} messages for chat ${chatId} (last two)\n${previewLines}`,
      {
        location: 'intent.analyze.getLastMessages',
      }
    )

    return ordered
  } catch (error) {
    logger.error('Failed to get chat messages for context analysis', {
      error,
      chatId,
      location: 'intent.analyze.getLastMessages',
    })
    return []
  }
}

export const buildDetermine = (params: UseCaseParams): DetermineIntent => {
  return async ({
    botSecretKey,
    message,
    audioFile,
    chatId,
    analyzeIntent = true,
    analyzeContext = false,
    analyzeComplexity = false,
  }: AnalyzeIntentParams): Promise<IntentAnalysisResponse> => {

    // Валидация
    if (!botSecretKey || botSecretKey !== config.telegram.bot.secret_key) {
      throw new InvalidDataError({ code: 'TOKEN_INVALID' })
    }

    // Получаем текст (из сообщения или аудио)
    let text = message
    let transcript: string | undefined = undefined

    if (!text && audioFile) {
      text = await transcribeWithFallback(params.service.speech2Text, audioFile)
      transcript = text
    }

    if (!text) {
      throw new InvalidDataError({
        code: 'NO_INPUT',
        message: 'No message or audio provided',
      })
    }

    // Подготавливаем историю сообщений если нужен анализ контекста
    let messageHistory: string | undefined = undefined
    
    if (analyzeContext && chatId) {
      logger.info(`AnalyzeIntent: received chatId=${chatId}`)
      const messages = await getLastMessages(chatId, params)
      logger.info(`AnalyzeIntent: message history size=${messages.length}`)
      
      if (messages.length > 0) {
        messageHistory = messages
          .map(msg => `${msg.role.toUpperCase()}: ${msg.content || ''}`)
          .join('\n')
      }
    }

    // Используем унифицированный метод analyze
    const result = await params.service.intent.analyze({
      message: text,
      messageHistory,
      features: {
        intent: analyzeIntent,
        context: analyzeContext,
        complexity: analyzeComplexity
      }
    })

    // Логируем результаты
    logger.info(`AnalyzeIntent: intent=${result.intent}`)
    if (result.context_reset_needed !== undefined) {
      logger.info(`AnalyzeIntent: context_reset_needed=${result.context_reset_needed}`)
    }
    if (result.complexity) {
      logger.info(`AnalyzeIntent: complexity=${result.complexity}`)
    }

    // Форматируем ответ согласно IntentAnalysisResponse
    return {
      type: result.intent!,
      ...(transcript ? { transcript } : {}),
      ...(result.context_reset_needed !== undefined ? { context_reset_needed: result.context_reset_needed } : {}),
      ...(result.complexity ? { model_complexity: result.complexity } : {})
    }
  }
}
