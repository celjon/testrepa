import { UseCaseParams } from '@/domain/usecase/types'
import { IChat } from '@/domain/entity/chat'
import { NotFoundError } from '@/domain/errors'
import { isTextModel } from '@/domain/entity/model'
import { IFile } from '@/domain/entity/file'

export type CreateChat = (params: {
  id: string
  userId: string
  chatId?: string
}) => Promise<IChat | never>

export const buildCreateChat =
  ({ adapter, service }: UseCaseParams): CreateChat =>
  async ({ id, userId, chatId }) => {
    const preset = await adapter.presetRepository.get({
      where: { id },
      include: {
        attachments: {
          include: {
            file: true,
          },
        },
        model: true,
      },
    })

    if (!preset) {
      throw new NotFoundError({
        code: 'PRESET_NOT_FOUND',
      })
    }

    let chat = await adapter.chatRepository.get({
      where: {
        ...(chatId && {
          id: chatId,
        }),
        ...(!chatId && {
          user_id: userId,
          initial: true,
        }),
        deleted: false,
      },
      include: {
        model: true,
      },
    })

    if (!chat) {
      const subscription = await service.user.getActualSubscriptionById(userId)

      if (!subscription || !subscription.plan) {
        throw new NotFoundError({
          code: 'SUBSCRIPTION_NOT_FOUND',
        })
      }

      chat = await service.chat.initialize({
        initial: true,
        userId,
        plan: subscription.plan,
      })

      if (!chat) {
        throw new NotFoundError({
          code: 'CHAT_NOT_FOUND',
        })
      }
    }

    if (preset.model_id) {
      chat =
        (await adapter.chatRepository.update({
          where: {
            id: chat.id,
          },
          data: {
            model_id: preset.model_id,
            settings: {
              upsert: {
                create: {},
                update: {},
              },
            },
          },
          include: {
            model: true,
          },
        })) ?? chat
    }

    if (chat.model && chat.model_id && !chat.model.parent_id && isTextModel(chat.model)) {
      const files = (preset.attachments || [])
        .map((attachment) => attachment.file)
        .filter((file) => !!file) as IFile[]

      const copiedFiles = (await Promise.all(
        files.map((file) =>
          adapter.fileRepository.create({
            data: {
              type: file.type,
              name: file.name,
              size: file.size,
              url: file.url,
              path: file.path,
            },
          }),
        ),
      ).then((files) => files.filter((file) => !!file))) as IFile[]

      const { prompt } = await service.message.generatePrompt({
        content: preset.system_prompt,
        files: copiedFiles,
      })

      await adapter.chatSettingsRepository.update({
        where: {
          chat_id: chat.id,
        },
        data: {
          text: {
            upsert: {
              create: {
                preset_id: preset.id,
                system_prompt: preset.system_prompt,
                full_system_prompt: prompt,
                files: {
                  connect: copiedFiles.map(({ id }) => ({ id })),
                },
              },
              update: {
                preset_id: preset.id,
                system_prompt: preset.system_prompt,
                full_system_prompt: prompt,
                files: {
                  connect: copiedFiles.map(({ id }) => ({ id })),
                },
              },
            },
          },
        },
      })
    } else {
      throw new NotFoundError({
        code: 'MODEL_NOT_FOUND',
      })
    }

    await adapter.presetRepository.update({
      where: {
        id: preset.id,
      },
      data: {
        usage_count: {
          increment: 1,
        },
      },
    })

    return chat
  }
