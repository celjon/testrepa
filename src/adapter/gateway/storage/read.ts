import { MINIO_STORAGE } from '@/adapter/consts'
import { config } from '@/config'
import axios, { AxiosError } from 'axios'

export type Read = (params: { path: string }) => Promise<Buffer>

export const buildRead =
  (): Read =>
  async ({ path }) => {
    try {
      const url = `https://${config.minio.host}/${MINIO_STORAGE}/${path}`
      const { data } = await axios<Buffer>({
        method: 'get',
        url,
        responseType: 'arraybuffer'
      })

      return data
    } catch (error) {
      if (error instanceof AxiosError && error.response && error.response.status === 404) {
        return Buffer.from('')
      } else {
        throw error
      }
    }
  }
