import sharp from 'sharp'

export type Resize = (params: { buffer: Buffer; width?: number; height?: number }) => Promise<{
  buffer: Buffer
  info: {
    width: number
    height: number
  }
}>

export const buildResize =
  (): Resize =>
  async ({ buffer, width, height }) => {
    const { data, info } = await sharp(buffer)
      .resize(width && Math.floor(width), height && Math.floor(height), { fit: 'inside' })
      .jpeg()
      .toBuffer({ resolveWithObject: true })

    return {
      buffer: data,
      info
    }
  }
