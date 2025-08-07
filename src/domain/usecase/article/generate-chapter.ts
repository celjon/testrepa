import { concatMap, Observable } from 'rxjs'
import dedent from 'dedent'
import { ArticleStyle, Platform } from '@prisma/client'
import { NotFoundError } from '@/domain/errors'
import { determinePlatform } from '@/domain/entity/action'
import { UseCaseParams } from '../types'
import { GetChildModel } from './get-child-model'
import { HandleResponseStreamWithChat } from './handle-response-stream-with-chat'
import { articlePrompts } from './article-prompts'
import { languagePrompts } from './prompts'
import { ValidArticleStyle } from '@/domain/entity/article'

type Params = UseCaseParams & {
  getChildModel: GetChildModel
  handleResponseStreamWithChat: HandleResponseStreamWithChat
}

export type GenerateChapter = (params: {
  articleId: string
  model_id: string
  creativity: number
  chapterPrompt: string
  language: string
  userId: string
  keyEncryptionKey: string | null
}) => Promise<{
  responseStream$: Observable<{
    status: 'pending' | 'done'
    contentDelta: string
    spentCaps: number | null
    caps: bigint | null
  }>
  closeStream: () => void
}>

export const buildGenerateChapter = ({
  service,
  adapter,
  getChildModel,
  handleResponseStreamWithChat,
}: Params): GenerateChapter => {
  return async ({
    articleId,
    model_id,
    creativity,
    chapterPrompt,
    language,
    userId,
    keyEncryptionKey,
  }) => {
    const { model, subscription, employee, user } = await getChildModel({
      model_id,
      userId,
    })

    const article = await adapter.articleRepository.get({
      where: { id: articleId },
    })
    if (!article || !article.chat_id) {
      throw new NotFoundError({
        code: 'ARTICLE_NOT_FOUND',
      })
    }

    const chat = await adapter.chatRepository.get({
      where: { id: article.chat_id, deleted: false },
      include: { settings: { include: { text: true } } },
    })
    if (!chat) {
      throw new NotFoundError({
        code: 'CHAT_NOT_FOUND',
      })
    }

    const localizedPrompts = articlePrompts[language] || articlePrompts.ru
    const selectedArticleStyle =
      article.style === ArticleStyle.CUSTOM
        ? article.customStyle
        : localizedPrompts.articleStyle[
            article.style as unknown as Exclude<ValidArticleStyle, 'CUSTOM'>
          ]

    const prompt = dedent`
      <article>
      ${article.content}
      </article>
      <articleStyle>${selectedArticleStyle}</articleStyle>
      <articleLinkStyle>${localizedPrompts.articleLinkStyle[article.linkStyle]}</articleLinkStyle>
      <language>${languagePrompts[language]}</language>
      <outputFormat>Markdown</outputFormat>
      ${localizedPrompts.generateChapter} ${chapterPrompt.trim().length > 0 ? `<additionalPrompt>${chapterPrompt}</additionalPrompt>` : ''}
    `

    const userMessage = await service.message.storage.create({
      user,
      keyEncryptionKey,
      data: {
        data: {
          role: 'user',
          chat_id: chat.id,
          user_id: userId,
          disabled: false,
          content: prompt,
          full_content: prompt,
          platform: determinePlatform(Platform.WEB, !!employee?.enterprise_id),
        },
      },
    })

    service.chat.eventStream.emit({
      chat,
      event: {
        name: 'MESSAGE_CREATE',
        data: {
          message: userMessage,
        },
      },
    })

    const messages = await service.message.storage.list({
      user,
      keyEncryptionKey,
      data: {
        where: {
          chat_id: chat.id,
          user_id: userId,
        },
        orderBy: {
          created_at: 'asc',
        },
        take: 1,
      },
    })

    const textStream$ = await service.message.text.sendByProvider({
      providerId: null,
      user,
      model,
      messages: [userMessage],
      settings: {
        // message that contains the original utils prompt
        system_prompt: messages[0].content ?? '',
        temperature: creativity,
        max_tokens: model.max_tokens,
      },
      planType: subscription?.plan?.type ?? null,
    })

    const { responseStream$, closeStream } = await handleResponseStreamWithChat({
      user,
      keyEncryptionKey,
      chat,
      model,
      prompt,
      subscription,
      employee,
      textStream$,
      additionalCaps: 0,
    })

    let isFirstDelta = true
    const response$ = responseStream$.pipe(
      concatMap(async (data) => {
        if (isFirstDelta) {
          isFirstDelta = false

          if (!article.content.endsWith('\n\n')) {
            // new chapter must start with a new line
            article.content += '\n\n'
            data.contentDelta = `\n\n${data.contentDelta}`
          }
        }

        if (data.status === 'done' && data.spentCaps !== null) {
          await adapter.articleRepository.update({
            where: { id: article.id },
            data: {
              content: `${article.content}${data.content}\n\n`,
              spentCaps: article.spentCaps + data.spentCaps,
            },
          })

          return {
            status: data.status,
            contentDelta: `${data.contentDelta}\n\n`,
            caps: data.caps,
            spentCaps: data.spentCaps,
          }
        }

        return {
          status: data.status,
          contentDelta: data.contentDelta,
          caps: data.caps,
          spentCaps: data.spentCaps,
        }
      }),
    )

    return {
      responseStream$: response$,
      closeStream,
    }
  }
}
