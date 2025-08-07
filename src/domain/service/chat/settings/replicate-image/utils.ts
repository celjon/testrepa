import { IChatReplicateImageSettings } from '@/domain/entity/chat-settings'

export const defaultSettings: Omit<
  IChatReplicateImageSettings,
  'id' | 'created_at' | 'model' | 'output_format'
> = {
  aspect_ratio: '1:1',
  steps: 25,
  guidance: 3,
  interval: 2,
  seed: 0,
  output_quality: 80,
  num_outputs: 1,
  negative_prompt: '',
  prompt_strength: 0.8,
}

export const aspectRatios = [
  '1:1',
  '16:9',
  '9:16',
  '21:9',
  '9:21',
  '2:3',
  '3:2',
  '4:5',
  '5:4',
] as const

export const fluxProAspectRatios = ['1:1', '16:9', '9:16', '2:3', '3:2', '4:5', '5:4'] as const

export const getAspectRatio = <T extends string>(
  aspectRatios: readonly T[],
  aspectRatio?: string,
): T => {
  if (!aspectRatio) {
    return aspectRatios[0]
  }

  if (aspectRatios.includes(aspectRatio as T)) {
    return aspectRatio as T
  }

  return aspectRatios[0]
}
