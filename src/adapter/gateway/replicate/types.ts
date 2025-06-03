export const aspectRatios = ['1:1', '16:9', '9:16', '21:9', '9:21', '2:3', '3:2', '4:5', '5:4'] as const

export const fluxProAspectRatios = ['1:1', '16:9', '9:16', '2:3', '3:2', '4:5', '5:4'] as const

export type AspectRatio = (typeof aspectRatios)[number]

export type FluxProAspectRatio = (typeof fluxProAspectRatios)[number]

export const imageFormats = ['jpg', 'png', 'webp'] as const

export type ImageFormat = (typeof imageFormats)[number]
