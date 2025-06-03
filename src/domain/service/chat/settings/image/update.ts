import { Prisma } from '@prisma/client'
import { IModel } from '@/domain/entity/model'
import { IChatImageSettings } from '@/domain/entity/chatSettings'
import { RawFileWithoutBuffer } from '@/domain/entity/file'

export type Update = (params: {
  defaultModel?: IModel
  settings?: IChatImageSettings
  values?: Record<string, null | string | number | boolean | RawFileWithoutBuffer[]>
}) => Prisma.ChatImageSettingsUpdateInput

export const buildUpdate = (): Update => {
  return ({ values }) => {
    return {
      ...values,
      ...(values?.model && {
        size: '1024x1024',
        quality: values.model === 'gpt-image-1' ? 'low' : 'standard',
        style: 'default'
      })
    }
  }
}
