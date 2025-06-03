import axios from 'axios'

export type Download = (params: { url: string }) => Promise<Buffer>

export const buildDownload =
  (): Download =>
  async ({ url }) => {
    const { data } = await axios<Buffer>({
      method: 'get',
      url,
      responseType: 'arraybuffer'
    })

    return data
  }
