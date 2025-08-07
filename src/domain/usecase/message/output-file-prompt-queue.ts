import { UseCaseParams } from '@/domain/usecase/types'
import JSZip from 'jszip'
import { ChatCompletionMessageParam } from 'openai/resources'
import { Document, HeadingLevel, Packer, Paragraph } from 'docx'
import { ForbiddenError, InvalidDataError, NotFoundError } from '@/domain/errors'
import { runWithConcurrencyLimit } from '@/lib'
import { clearFromMarkdownMarkup } from '@/lib/utils/clear-from-markdown-markup'
import { ISubscription } from '@/domain/entity/subscription'
import { IEmployee } from '@/domain/entity/employee'
import { Adapter } from '@/adapter'
import { Service } from '@/domain/service'
import { EventEmitter } from 'events'
import { Platform } from '@prisma/client'
import { config } from '@/config'
import { ProgressEventPayload } from '@/domain/entity/prompt-queue-event'
import { isTextModel } from '@/domain/entity/model'
import { SubscriptionService } from '@/domain/service/subscription'
import { ModelService } from '@/domain/service/model'
import { PromptItem } from '@/domain/entity/prompt-item'

export type Markup = 'md' | 'html' | 'docx'

export interface ZipPackingResult {
  queueId: string
  path?: string
  progressEmitter: EventEmitter
}

const realAddress = config.http.real_address

type Params = UseCaseParams
export type OutputFilePromptQueue = (params: {
  prompts: PromptItem[]
  userId: string
  markup: Markup
  locale: string
  chatId: string
  outputOneFile: boolean
  developerKeyId?: string
}) => Promise<ZipPackingResult>

export const buildOutputFilePromptQueue =
  ({ adapter, service }: Params): OutputFilePromptQueue =>
  async ({ prompts, userId, markup = 'docx', locale, outputOneFile, developerKeyId, chatId }) => {
    const progressEmitter = new EventEmitter()
    const maxQueuesPerUser = 3
    let isCancelled = false
    let filePath: string = ''
    const cancelFn = async () => {
      isCancelled = true
      await adapter.promptQueuesRepository.removePromptQueue({ userId, queueId })
      await adapter.chatRepository.update({ where: { id: chatId }, data: { queue_id: null } })
    }

    const queueId = await adapter.promptQueuesRepository.createPromptQueue({
      userId,
      cancelFn,
      maxQueuesPerUser,
    })

    const emitProgress = (data: ProgressEventPayload) => {
      progressEmitter.emit('progress', data)
      service.message.eventStream.promptQueueEmit({
        queueId,
        event: data,
      })
    }
    const user = await adapter.userRepository.get({ where: { id: userId } })
    if (!user) throw new NotFoundError({ code: 'USER_NOT_FOUND' })

    const chat = await adapter.chatRepository.get({ where: { id: chatId } })
    let chatName: string = chat?.name ?? ''

    if (chat?.name === null) {
      chatName = await service.chat.generateName({
        user,
        messages: [{ role: 'assistant', content: prompts[0].message }],
      })

      await adapter.chatRepository.update({
        where: {
          id: chat.id,
        },
        data: {
          name: chatName,
          initial: false,
        },
      })
      service.chat.eventStream.emit({
        chat,
        event: {
          name: 'UPDATE',
          data: {
            chat: {
              name: chatName,
              initial: false,
            },
          },
        },
      })
    }

    async function processPrompts() {
      const totalPrompts = prompts.length
      let donePrompts = 0
      let hasSuccessfulPrompt = true
      try {
        const subscription = await service.user.getActualSubscriptionById(userId)
        await service.subscription.checkBalance({ subscription, estimate: 0 })

        const employee = await adapter.employeeRepository.get({
          where: { user_id: userId },
          include: { enterprise: true },
        })

        await service.enterprise.checkMonthLimit({ userId })
        const baseContext: ChatCompletionMessageParam[] = [
          { role: 'system', content: `Locale: ${locale}. Ответ должен быть в формате Markdown.` },
        ]

        const sequentialPrompts = prompts.filter((p) => p.include_context)
        let parallelPrompts = prompts.filter((p) => !p.include_context)

        const parallelArgs = parallelPrompts.map((prompt) => ({
          adapter,
          contextMessages: baseContext,
          employee,
          locale,
          markup,
          service,
          subscription: subscription!,
          userId,
          prompt,
          platform: Platform.PROMPT_QUEUE,
          developerKeyId,
          subscriptionService: service.subscription,
          modelService: service.model,
        }))

        const wrapped = async (args: Parameters<typeof processPrompt>[0]) => {
          if (isCancelled) return null
          try {
            const result = await processPrompt(args)
            donePrompts++
            emitProgress({ donePrompts, totalPrompts })
            return result
          } catch (err: any) {
            donePrompts++
            emitProgress({
              donePrompts,
              totalPrompts,
              error: err.message || err.code || 'prompt_error',
            })
            return null
          }
        }
        const parallelResults = (
          await runWithConcurrencyLimit(
            3,
            parallelArgs.map((a) => () => wrapped(a)),
            (f) => f(),
          )
        ).filter((r) => r !== null) as Awaited<ReturnType<typeof processPrompt>>[]

        const sequentialResults: Awaited<ReturnType<typeof processPrompt>>[] = []
        for (const prompt of sequentialPrompts) {
          if (isCancelled) break
          try {
            const res = await processPrompt({
              adapter,
              contextMessages: [],
              employee,
              locale,
              markup,
              service,
              subscription: subscription!,
              userId,
              prompt,
              developerKeyId,
              subscriptionService: service.subscription,
              modelService: service.model,
            })
            sequentialResults.push(res)
            donePrompts++
            emitProgress({ donePrompts, totalPrompts })
          } catch (err: any) {
            donePrompts++
            emitProgress({
              donePrompts,
              totalPrompts,
              error: err.message || err.code || 'prompt_error',
            })
          }
        }

        const allResults = [...parallelResults, ...sequentialResults]
        const successfulResults = allResults.filter((r) => r.content && r.content.length > 0)
        const hasSuccessfulPrompt = successfulResults.length > 0
        if (hasSuccessfulPrompt) {
          const zip = new JSZip()

          if (!outputOneFile) {
            for (const { fileName, content } of allResults) {
              zip.file(`${fileName}.${markup}`, content)
            }
          } else {
            await addCombinedToZip(zip, allResults, markup, locale)
          }

          const zipContent = await zip.generateAsync({ type: 'nodebuffer' })

          const temporaryFile = await adapter.storageGateway.writeTemporary({
            buffer: zipContent,
            ext: '.zip',
          })
          filePath = temporaryFile.path
          emitProgress({ donePrompts, totalPrompts, path: filePath, done: true })
        } else {
          emitProgress({ donePrompts, totalPrompts, done: true })
        }
      } catch (err: any) {
        emitProgress({
          donePrompts,
          totalPrompts,
          error: err.message || err.code || 'unknown error',
        })
      } finally {
        if (hasSuccessfulPrompt) {
          await adapter.promptQueuesRepository.removePromptQueue({ userId, queueId })
          await service.message.storage.create({
            user: user!,
            keyEncryptionKey: null,
            data: {
              data: {
                role: 'assistant',
                chat_id: chatId,
                user_id: userId,
                content: `${realAddress}message/zip-download-prompt-queue?path=${filePath}`,
              },
              include: {
                model: {
                  include: {
                    icon: true,
                    parent: {
                      include: {
                        icon: true,
                      },
                    },
                  },
                },
                job: true,
              },
            },
          })
          service.chat.eventStream.emit({
            chat: chat ?? undefined,
            event: {
              name: 'UPDATE',
              data: {
                chat: {
                  name: chatName,
                  initial: false,
                },
              },
            },
          })
        }

        progressEmitter.emit('end')

        await adapter.chatRepository.update({ where: { id: chatId }, data: { queue_id: null } })
      }
    }

    //DONT_AWAIT_THIS
    processPrompts()
    return { queueId, progressEmitter }
  }

async function processPrompt({
  adapter,
  service,
  prompt,
  markup,
  locale,
  userId,
  subscription,
  employee,
  contextMessages,
  developerKeyId,
  subscriptionService,
  modelService,
}: {
  adapter: Adapter
  service: Service
  prompt: PromptItem
  markup: Markup
  locale: string
  userId: string
  subscription: ISubscription
  employee: IEmployee | null
  contextMessages: ChatCompletionMessageParam[]
  developerKeyId?: string
  subscriptionService: SubscriptionService
  modelService: ModelService
}): Promise<{
  request: string
  responseText: string
  fileName: string
  content: string | Buffer
}> {
  const instruction = {
    md: 'Ответ должен быть в формате Markdown.',
    html: 'Ответ должен быть в формате HTML.',
    docx: 'Ответ должен быть в формате Markdown.',
  }[markup]

  const userMessage = { role: 'user', content: prompt.message }
  const messages: ChatCompletionMessageParam[] = prompt.include_context
    ? [...contextMessages, userMessage as ChatCompletionMessageParam]
    : [
        { role: 'system', content: `Locale: ${locale}. ${instruction}` },
        userMessage as ChatCompletionMessageParam,
      ]

  const model = await adapter.modelRepository.get({ where: { id: prompt.modelId } })
  if (!model) throw new NotFoundError({ code: 'MODEL_NOT_FOUND' })
  const settings = {
    model: `${model.prefix}${model.id}`,
    system_prompt: `Locale: ${locale}. ${instruction}`,
  }

  //estimate
  await subscriptionService.checkBalance({
    subscription,
    estimate: await modelService.estimate.promptQueue({
      constantCost: config.constantCosts[subscription!.plan!.type],
      prompt,
      messages,
      model,
    }),
  })

  let { hasAccess, reasonCode } = await service.plan.hasAccess(
    subscription.plan!,
    model.id,
    employee?.id,
  )
  if (isTextModel(model)) {
    const access = await service.plan.hasAccess(subscription.plan!, model.id, employee?.id)
    hasAccess = access.hasAccess
    reasonCode = access.reasonCode
  } else {
    throw new ForbiddenError({
      code: 'MODEL_NOT_ALLOWED_FOR_PROMPT_QUEUE',
    })
  }

  if (!hasAccess) {
    throw new ForbiddenError({
      code: reasonCode ?? 'MODEL_NOT_ALLOWED_FOR_PLAN',
    })
  }

  const response = await adapter.openrouterGateway.sync({
    endUserId: userId,
    messages,
    settings,
  })

  if (!response.usage) throw new InvalidDataError({ code: 'UNABLE_TO_SEND_MESSAGE' })

  const caps = await service.model.getCaps.text({ model, usage: response.usage })
  await service.subscription.writeOffWithLimitNotification({
    subscription,
    amount: caps,
    meta: {
      userId,
      enterpriseId: employee?.enterprise_id,
      platform: Platform.PROMPT_QUEUE,
      model_id: model.id,
      provider_id: config.model_providers.openrouter.id,
      developerKeyId,
    },
  })

  const responseText = response.message.content?.trim() || ''
  if (prompt.include_context) {
    contextMessages.push(userMessage as ChatCompletionMessageParam)
    contextMessages.push({ role: 'assistant', content: responseText })
  }

  const fileName = await service.chat.generateName({
    user: { id: userId },
    messages: [userMessage],
  })
  const { content } = await prepareText({ markup, responseText, adapter })
  return { request: prompt.message, responseText, fileName, content }
}

async function prepareText({
  markup,
  responseText,
  adapter,
}: {
  markup: Markup
  responseText: string
  adapter: Adapter
}): Promise<{ content: string | Buffer }> {
  if (markup === 'html') {
    return {
      content: `
<html lang="locale">
  <head>
    <style>body { font-family: Arial, sans-serif; }</style>
  </head>
  <body>
    ${responseText}
  </body>
</html>`,
    }
  }

  if (markup === 'md') {
    return { content: responseText }
  }

  const paragraphs = await adapter.documentGateway.parseMdToDocxBlocks({ responseText })
  const doc = new Document({
    numbering: {
      config: [
        {
          reference: 'numbered-list',
          levels: [{ level: 0, format: 'decimal', text: '%1.', alignment: 'left' }],
        },
      ],
    },
    sections: [{ properties: {}, children: paragraphs }],
  })
  const buffer = await Packer.toBuffer(doc)
  return { content: buffer }
}

async function addCombinedToZip(
  zip: JSZip,
  results: Array<
    { request: string; responseText: string } & { fileName: string; content: string | Buffer }
  >,
  markup: Markup,
  locale: string,
) {
  if (markup === 'md') {
    const combined = results
      .map((r) => `**Запрос:**\n${r.request}\n\n**Ответ:**\n${r.responseText}\n\n---\n\n`)
      .join('')
      .trim()
    zip.file(`all-responses.md`, combined)
    return
  }

  if (markup === 'html') {
    const body = results
      .map(
        (r) =>
          `<h2>Запрос:</h2><p>${r.request}</p>\n<h3>Ответ:</h3><p>${r.responseText}</p>\n<hr/>\n`,
      )
      .join('')
      .trim()
    const combined = `
<!DOCTYPE html>
<html lang="${locale}">
  <head>
    <meta charset="utf-8">
    <style>body { font-family: Arial, sans-serif; }</style>
  </head>
  <body>
    ${body}
  </body>
</html>`.trim()
    zip.file(`all-responses.html`, combined)
    return
  }

  const children: Paragraph[] = []
  for (const { request, responseText } of results) {
    children.push(new Paragraph({ text: `Запрос: ${request}`, heading: HeadingLevel.HEADING_2 }))
    const lines = clearFromMarkdownMarkup(responseText)
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean)
    for (const line of lines) {
      children.push(new Paragraph(line))
    }
    children.push(new Paragraph(''))
  }
  const doc = new Document({ sections: [{ properties: {}, children }] })
  const buffer = await Packer.toBuffer(doc)
  zip.file('all-responses.docx', buffer)
}
