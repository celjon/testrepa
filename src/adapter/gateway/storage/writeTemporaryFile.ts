import { MINIO_STORAGE, MINIO_TEMP_PREFIX } from '@/adapter/consts'
import { AdapterParams } from '@/adapter/types'
import { config } from '@/config'
import { isImage } from '@/lib'
import { randomUUID } from 'crypto'
import mime from 'mime-types'

type Params = Pick<AdapterParams, 'minio'>

export type WriteTemporary = (params: { buffer: Buffer; ext: string }) => Promise<{
  id: string
  name: string
  path: string
  url: string
  buffer: Buffer
}>

export const buildWriteTemporary =
  ({ minio }: Params): WriteTemporary =>
  async ({ buffer, ext }) => {
    const id = randomUUID()
    const name = id

    let path
    if (isImage(ext)) {
      path = `${config.minio.instance_folder}/${MINIO_TEMP_PREFIX}images/${id}${ext.toLowerCase()}`
    } else {
      path = `${config.minio.instance_folder}/${MINIO_TEMP_PREFIX}files/${id}${ext.toLowerCase()}`
    }

    const url = `https://${config.minio.host}/${MINIO_STORAGE}/${path}`
    const type = mime.lookup(path)

    await minio.client.putObject(MINIO_STORAGE, path, buffer, undefined, {
      ...(type && {
        'Content-Type': type
      })
    })

    return { id, name, url, path, buffer }
  }
