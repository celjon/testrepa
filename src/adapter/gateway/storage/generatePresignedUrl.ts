import { AdapterParams } from '@/adapter/types'
import { config } from '@/config'
import { randomUUID } from 'crypto'
import { isImage } from '@/lib'
import { MINIO_STORAGE } from '@/adapter/consts'

type Params = Pick<AdapterParams, 'minio'>

export type GeneratePresignedUrl = (params: { ext: string }) => Promise<{
  id: string
  name: string
  path: string
  url: string
}>

export const buildGeneratePresignedUrl =
  ({ minio }: Params): GeneratePresignedUrl =>
  async ({ ext }) => {
    const id = randomUUID()
    const name = id

    let path
    if (isImage(ext)) {
      path = `${config.minio.instance_folder}/images/${id}${ext.toLowerCase()}`
    } else {
      path = `${config.minio.instance_folder}/files/${id}${ext.toLowerCase()}`
    }

    const url = await minio.client.presignedPutObject(MINIO_STORAGE, path, 300)

    const publicUrl = `https://${config.minio.host}/${MINIO_STORAGE}/${path}`

    return { id, name, path, url: publicUrl, presignedUrl: url }
  }
