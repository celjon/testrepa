import sharp from 'sharp'

export type Extract = (params: { buffer: Buffer; top: number; left: number; width: number; height: number }) => Promise<{
  buffer: Buffer
  info: {
    width: number
    height: number
  }
}>

export const buildExtract =
  (): Extract =>
  async ({ buffer, top, left, width, height }) => {
    const { data, info } = await sharp(buffer)
      .extract({
        top: Math.floor(top),
        left: Math.floor(left),
        width: Math.floor(width),
        height: Math.floor(height)
      })
      .png()
      .toBuffer({ resolveWithObject: true })

    return {
      buffer: data,
      info
    }
  }
