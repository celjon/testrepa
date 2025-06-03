import { Prisma } from '@prisma/client'
import {
  IModel,
  isFlux,
  isFlux11Pro,
  isFluxDev,
  isFluxPro,
  isFluxSchnell,
  isStableDiffusion,
  isStableDiffusion3
} from '@/domain/entity/model'
import {
  buildCreateFlux11ProSettings,
  buildCreateFluxDefaultSettings,
  buildCreateFluxDevSettings,
  buildCreateFluxProSettings,
  buildCreateFluxSchnellSettings,
  buildCreateSD3Settings
} from './create'
import { InvalidDataError } from '@/domain/errors'
import { IChatReplicateImageSettings } from '@/domain/entity/chatSettings'
import { RawFileWithoutBuffer } from '@/domain/entity/file'

export type Update = (params: {
  defaultModel?: IModel
  settings?: IChatReplicateImageSettings
  values?: Record<string, null | string | number | boolean | RawFileWithoutBuffer[]>
}) => Prisma.ChatReplicateImageSettingsUpdateInput

export const buildUpdate = (): Update => {
  const createFluxProSettings = buildCreateFluxProSettings()
  const createFluxDevSettings = buildCreateFluxDevSettings()
  const createFluxSchnellSettings = buildCreateFluxSchnellSettings()
  const createFlux11ProSettings = buildCreateFlux11ProSettings()
  const createFluxDefaultSettings = buildCreateFluxDefaultSettings()
  const createSD3Settings = buildCreateSD3Settings()

  return ({ defaultModel, settings, values }) => {
    if (!defaultModel || !settings) {
      return {
        ...values,
        ...(values?.model && {
          num_outputs: 1
        })
      }
    }

    if (isFlux(defaultModel)) {
      if (isFluxPro({ id: settings.model })) {
        return createFluxProSettings({ defaultModel, settings })
      }

      if (isFluxDev({ id: settings.model })) {
        return createFluxDevSettings({ defaultModel, settings })
      }

      if (isFluxSchnell({ id: settings.model })) {
        return createFluxSchnellSettings({ defaultModel, settings })
      }

      if (isFlux11Pro({ id: settings.model })) {
        return createFlux11ProSettings({ defaultModel, settings })
      }

      return createFluxDefaultSettings({ defaultModel, settings })
    }

    if (isStableDiffusion(defaultModel)) {
      if (isStableDiffusion3({ id: settings.model })) {
        return createSD3Settings({ defaultModel, settings })
      }

      return createSD3Settings({ defaultModel, settings })
    }

    throw new InvalidDataError({
      code: 'MODEL_NOT_SUPPORTED'
    })
  }
}
