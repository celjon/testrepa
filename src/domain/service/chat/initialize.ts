import { Platform } from '@prisma/client'
import { ChatPlatform, IChat } from '@/domain/entity/chat'
import { IModel } from '@/domain/entity/model'
import { IPlan } from '@/domain/entity/plan'
import { NotFoundError } from '@/domain/errors'
import { IChatSettings } from '@/domain/entity/chat-settings'
import { Adapter } from '../../types'
import { ModelService } from '../model'
import { SettingsService } from './settings'

type Params = Adapter & {
  settingsService: SettingsService
  modelService: ModelService
}

export type Initialize = (params: {
  userId: string
  groupId?: string
  plan: IPlan
  name?: string | null
  modelId?: string
  highlight?: string
  initial?: boolean
  platform?: ChatPlatform
  order?: number
}) => Promise<IChat | never>

export const buildInitialize = ({
  chatRepository,
  groupRepository,
  modelRepository,
  modelFunctionRepository,
  settingsService,
  modelService,
}: Params): Initialize => {
  return async ({
    groupId,
    plan,
    userId,
    name,
    highlight,
    modelId,
    initial = false,
    platform,
    order,
  }) => {
    let model: IModel | null

    if (modelId) {
      model = await modelRepository.get({
        where: {
          id: modelId,
          parent_id: null,
        },
      })

      if (!model) {
        throw new NotFoundError({ code: 'MODEL_NOT_FOUND' })
      }
    } else {
      model = await modelService.getDefault({ plan })

      if (!model) {
        throw new NotFoundError({
          code: 'DEFAULT_MODEL_NOT_FOUND',
          message: 'Default model not found while initializing new chat',
        })
      }
    }

    const modelFunction = await modelFunctionRepository.get({
      where: {
        model_id: model.id,
        is_default: true,
      },
    })

    const settings: IChatSettings = await settingsService.upsert({
      parentModel: model,
      plan,
    })

    platform = platform === Platform.TELEGRAM ? Platform.TELEGRAM : Platform.WEB

    if (platform === Platform.TELEGRAM) {
      const telegramGroup = await groupRepository.get({
        where: { id: 'telegram' },
      })

      if (!telegramGroup) {
        await groupRepository.create({
          data: {
            id: 'telegram',
            name: 'Telegram',
            user_id: userId,
            order: 0,
          },
        })
      }

      groupId = 'telegram'
    }

    const chat = await chatRepository.create({
      data: {
        user_id: userId,
        ...(groupId && { group_id: groupId }),
        name,
        highlight,
        model_id: model.id,
        ...(modelFunction && {
          model_function_id: modelFunction.id,
        }),
        initial,
        settings: {
          connect: {
            id: settings.id,
          },
        },
        platform,
        order,
      },
      include: {
        model: true,
        settings: {
          include: {
            text: true,
            image: true,
            speech: true,
            replicateImage: true,
            mj: true,
          },
        },
      },
    })

    return chat
  }
}
