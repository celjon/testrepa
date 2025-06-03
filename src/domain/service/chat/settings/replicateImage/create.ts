import { IChatReplicateImageSettings } from '@/domain/entity/chatSettings'
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
import { InvalidDataError } from '@/domain/errors'
import { clamp } from '@/lib'
import { Prisma } from '@prisma/client'
import { aspectRatios, defaultSettings, fluxProAspectRatios, getAspectRatio } from './utils'

export type Create = (params: {
  defaultModel: Pick<IModel, 'id'>
  settings?: IChatReplicateImageSettings
}) => Prisma.ChatReplicateImageSettingsCreateInput

export const buildCreate = (): Create => {
  const createFluxProSettings = buildCreateFluxProSettings()
  const createFluxDevSettings = buildCreateFluxDevSettings()
  const createFluxSchnellSettings = buildCreateFluxSchnellSettings()
  const createFlux11ProSettings = buildCreateFlux11ProSettings()
  const createFluxDefaultSettings = buildCreateFluxDefaultSettings()
  const createSD3Settings = buildCreateSD3Settings()

  return ({ defaultModel, settings }) => {
    if (isFlux(defaultModel)) {
      if (isFluxPro({ id: settings?.model || '' })) {
        return createFluxProSettings({ defaultModel, settings })
      }

      if (isFluxDev({ id: settings?.model || '' })) {
        return createFluxDevSettings({ defaultModel, settings })
      }

      if (isFluxSchnell({ id: settings?.model || '' })) {
        return createFluxSchnellSettings({ defaultModel, settings })
      }

      if (isFlux11Pro({ id: settings?.model || '' })) {
        return createFlux11ProSettings({ defaultModel, settings })
      }

      return createFluxDefaultSettings({ defaultModel, settings })
    }

    if (isStableDiffusion(defaultModel)) {
      if (isStableDiffusion3({ id: settings?.model || '' })) {
        return createSD3Settings({ defaultModel, settings })
      }

      return createSD3Settings({ defaultModel, settings })
    }

    throw new InvalidDataError({
      code: 'MODEL_NOT_SUPPORTED'
    })
  }
}

export const buildCreateFluxProSettings = (): Create => {
  return ({ settings }) => ({
    ...defaultSettings,
    aspect_ratio: getAspectRatio(fluxProAspectRatios, settings?.aspect_ratio),
    steps: settings?.steps ? clamp(settings.steps, 1, 50) : 25,
    guidance: settings?.guidance ? clamp(settings.guidance, 2, 5) : 3,
    interval: settings?.interval ? clamp(settings.interval, 1, 4) : 2,
    seed: 0,
    output_quality: settings?.output_quality ? clamp(settings.output_quality, 0, 100) : 80
  })
}

export const buildCreateFluxDevSettings = (): Create => {
  return ({ settings }) => ({
    ...defaultSettings,
    aspect_ratio: getAspectRatio(aspectRatios, settings?.aspect_ratio),
    steps: settings?.steps ? clamp(settings.steps, 1, 50) : 28,
    guidance: settings?.guidance ? clamp(settings.guidance, 0, 10) : 3.5,
    seed: 0,
    output_quality: settings?.output_quality ? clamp(settings.output_quality, 0, 100) : 80
  })
}

export const buildCreateFluxSchnellSettings = (): Create => {
  return ({ settings }) => ({
    ...defaultSettings,
    aspect_ratio: getAspectRatio(aspectRatios, settings?.aspect_ratio),
    num_outputs: settings?.num_outputs ? clamp(settings.num_outputs, 1, 4) : 1,
    seed: 0,
    output_quality: settings?.output_quality ? clamp(settings.output_quality, 0, 100) : 80
  })
}

export const buildCreateFlux11ProSettings = (): Create => {
  return ({ settings }) => ({
    ...defaultSettings,
    aspect_ratio: getAspectRatio(fluxProAspectRatios, settings?.aspect_ratio),
    steps: settings?.steps ? clamp(settings.steps, 1, 50) : 25,
    num_outputs: 1,
    seed: 0,
    output_quality: settings?.output_quality ? clamp(settings.output_quality, 0, 100) : 80
  })
}

export const buildCreateFluxDefaultSettings = (): Create => {
  return ({ settings, defaultModel }) => ({
    ...defaultSettings,
    model: defaultModel.id,
    aspect_ratio: getAspectRatio(aspectRatios, settings?.aspect_ratio),
    num_outputs: 1,
    seed: 0,
    output_quality: settings?.output_quality ? clamp(settings.output_quality, 0, 100) : 80
  })
}

export const buildCreateSD3Settings = (): Create => {
  return ({ settings }) => ({
    ...defaultSettings,
    aspect_ratio: getAspectRatio(aspectRatios, settings?.aspect_ratio),
    steps: settings?.steps ? clamp(settings.steps, 1, 28) : 28,
    prompt_strength: settings?.prompt_strength ? clamp(settings.prompt_strength, 0, 1) : 0.8,
    output_quality: settings?.output_quality ? clamp(settings.output_quality, 0, 100) : 80,
    seed: 0,
    negative_prompt: settings?.negative_prompt || ''
  })
}
