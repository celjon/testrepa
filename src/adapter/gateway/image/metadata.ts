import sharp from 'sharp'

export type Metadata = (params: { buffer: Buffer }) => Promise<{
  width?: number
  height?: number
}>

export const buildMetadata =
  (): Metadata =>
  ({ buffer }) =>
    sharp(buffer).metadata()
