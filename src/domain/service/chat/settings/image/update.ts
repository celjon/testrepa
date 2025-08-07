import { Prisma } from '@prisma/client'
import { IModel } from '@/domain/entity/model'
import { IChatImageSettings } from '@/domain/entity/chat-settings'
import { RawFileWithoutBuffer } from '@/domain/entity/file'

export type Update = (params: {
  defaultModel?: IModel
  settings?: IChatImageSettings
  values?: Record<string, null | string | number | boolean | RawFileWithoutBuffer[]>
}) => Prisma.ChatImageSettingsUpdateInput

export const buildUpdate = (): Update => {
  return ({ values, defaultModel }) => {
    const model = values?.model ?? defaultModel?.id

    return {
      ...values,
      ...(model && {
        size: '1024x1024',
        quality: model === 'gpt-image-1' ? 'low' : 'standard',
        style: 'default',
      }),
    }
  }
}
