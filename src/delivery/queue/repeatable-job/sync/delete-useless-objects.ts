import { Client } from 'minio'
import { logger } from '@/lib/logger'
import { config } from '@/config'
import { DeliveryParams } from '@/delivery/types'
import { runWithConcurrencyLimit } from '@/lib'

type Params = Pick<DeliveryParams, 'fileRepository'> & {
  minioClient: Client
}

const batchSize = 500

const MINIO_CONCURRENCY = 50

export const buildDeleteUselessObjects =
  ({ minioClient, fileRepository }: Params) =>
  async () => {
    const bucketName = config.minio.bucket
    let totalDeletedFromDB = 0
    let totalDeletedFromMinio = 0

    if (!(await minioClient.bucketExists(bucketName))) {
      logger.error({
        location: 'deleteUselessObjects',
        message: `Bucket ${bucketName} does not exist`,
      })
      return
    }

    let lastId: string | null = null

    while (true) {
      const baseOrCondition = {
        OR: [
          { deleted_at: { not: null } },
          {
            attachments: { none: {} },
            messages_original_images: { none: {} },
            messages_preview_images: { none: {} },
            voices: { none: {} },
            videos: { none: {} },
            text_settings: { none: {} },
            models: { none: {} },
            model_customization: { none: {} },
            model_accounts: { none: {} },
            preset_attachments: { none: {} },
            avatars: { none: {} },
          },
        ],
      }

      const whereCondition: any = lastId
        ? { AND: [baseOrCondition, { id: { gt: lastId } }] }
        : baseOrCondition

      const orphanedFiles: { id: string; path: string | null }[] = await fileRepository.list({
        where: whereCondition,
        select: { id: true, path: true },
        orderBy: { id: 'asc' },
        take: batchSize,
      })

      if (orphanedFiles.length === 0) {
        break
      }

      const idsWithoutPath: string[] = []
      const filesWithPath: { id: string; path: string }[] = []
      for (const file of orphanedFiles) {
        if (!file.path) {
          idsWithoutPath.push(file.id)
        } else {
          filesWithPath.push({ id: file.id, path: file.path })
        }
      }

      const deleteResults: { id: string; ok: boolean }[] = await runWithConcurrencyLimit(
        MINIO_CONCURRENCY,
        filesWithPath,
        async (file) => {
          const { id, path } = file
          try {
            await minioClient.removeObject(bucketName, path, { forceDelete: true })
            return { id, ok: true }
          } catch (err) {
            logger.error({
              location: 'deleteUselessObjects',
              message: `Couldn't delete an object ${path} (id=${id}): ${err}`,
            })
            return { id, ok: false }
          }
        },
      )

      const successfulIds = deleteResults.filter((r) => r.ok).map((r) => r.id)

      const idsToDeleteInDb = [...idsWithoutPath, ...successfulIds]

      totalDeletedFromMinio += successfulIds.length

      if (idsToDeleteInDb.length > 0) {
        try {
          const deletedCount = await fileRepository.deleteMany({
            where: { id: { in: idsToDeleteInDb } },
          })
          totalDeletedFromDB += deletedCount
          logger.info({
            location: 'deleteUselessObjects',
            message: `Deleted ${deletedCount} files (rows in DB).`,
          })
        } catch (dbErr) {
          logger.error({
            location: 'deleteUselessObjects',
            message: `Error when deleting from the DB: ${dbErr}`,
          })
        }
      }

      lastId = orphanedFiles[orphanedFiles.length - 1].id
    }
    logger.info({
      location: 'deleteUselessObjects',
      message: `Finish. Total deleted rows from Minio: ${totalDeletedFromMinio}`,
    })
    logger.info({
      location: 'deleteUselessObjects',
      message: `Finish. Total deleted rows from DB: ${totalDeletedFromDB}`,
    })
  }
