import { MINIO_STORAGE } from '@/adapter/consts'
import { AdapterParams } from '@/adapter/types'
import { config, config as cfg } from '@/config'
import { isImage } from '@/lib'
import { randomUUID } from 'crypto'
import mime from 'mime-types'

type Params = Pick<AdapterParams, 'minio'>

export type Write = (params: { buffer: Buffer; ext: string }) => Promise<{
  id: string
  name: string
  path: string
  url: string
  buffer: Buffer
}>

export const buildWrite =
  ({ minio }: Params): Write =>
  async ({ buffer, ext }) => {
    const id = randomUUID()
    const name = id

    let path
    if (isImage(ext)) {
      path = `${cfg.minio.instance_folder}/images/${id}${ext.toLowerCase()}`
    } else {
      path = `${cfg.minio.instance_folder}/files/${id}${ext.toLowerCase()}`
    }

    const url = `https://${config.minio.host}/${MINIO_STORAGE}/${path}`
    const type = mime.lookup(path)

    await minio.client.putObject(MINIO_STORAGE, path, buffer, undefined, {
      'Cache-Control': 'public, max-age=31536000, immutable',
      ...(type && {
        'Content-Type': type,
      }),
    })

    return { id, name, url, path, buffer }
  }
