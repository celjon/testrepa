import { Client } from 'minio'
import { logger } from '@/lib/logger'
import { config as cfg } from '@/config'
import { DeliveryParams } from '@/delivery/types'

type Params = Pick<DeliveryParams, 'fileRepository'> & {
  minioClient: Client
}

export const buildDeleteStaleObjects =
  ({ minioClient, fileRepository }: Params) =>
  async () => {
    try {
      const bucketName = cfg.minio.bucket
      const instanceFolder = cfg.minio.instance_folder

      const startedAt = performance.now()
      const timeoutInMs = 2 * 60 * 60 * 1000

      if (!(await minioClient.bucketExists(bucketName))) {
        logger.error({
          location: 'deleteStaleObjects',
          message: `Bucket ${bucketName} does not exist`
        })
        return
      }

      const objectsIterator = minioClient.listObjects(bucketName, instanceFolder, true, {
        IncludeVersion: true
      })

      let objects: {
        name: string
        versionId: string | null
      }[] = []
      let objectsToRemove: {
        name: string
        versionId: string | null
      }[] = []
      let processedObjectsCount = 0

      const filesBatchSize = 1000
      const deleteBatchSize = 100

      for await (const obj of objectsIterator) {
        processedObjectsCount++

        if (obj.prefix) {
          // This is a directory/prefix, not an object
          continue
        }
        if (!obj.name?.trim()) {
          break
        }
        if (obj.name.startsWith(`${cfg.minio.instance_folder}/temporary/`)) {
          continue
        }

        const oneHourInMs = 60 * 60 * 1000
        if (new Date(obj.lastModified).getTime() > Date.now() - oneHourInMs) {
          // skip objects that live less then hour
          continue
        }

        objects.push({
          name: obj.name,
          versionId: obj.versionId
        })

        if (objects.length < filesBatchSize) {
          continue
        }

        const objectsInBatch = [...objects]
        objects = []

        const files = await fileRepository.list({
          where: {
            path: {
              in: [...new Set(objectsInBatch.map((obj) => obj.name))]
            }
          },
          select: { path: true }
        })
        const filesSet = new Set(files.filter((file) => !!file.path).map((file) => file.path))

        for (const obj of objectsInBatch) {
          if (!filesSet.has(obj.name)) {
            objectsToRemove.push({
              name: obj.name,
              versionId: obj.versionId
            })
          }
        }

        while (objectsToRemove.length >= deleteBatchSize) {
          const batchToRemove = objectsToRemove.slice(0, deleteBatchSize)
          objectsToRemove = objectsToRemove.slice(deleteBatchSize)

          const deleted = await deleteMinioObjects(minioClient, bucketName, batchToRemove)
          logger.info({
            location: 'deleteStaleObjects',
            message: `Deleted ${deleted} objects`
          })
        }

        if (performance.now() > startedAt + timeoutInMs) {
          break
        }
      }

      if (objectsToRemove.length >= 0) {
        const deleted = await deleteMinioObjects(minioClient, bucketName, objectsToRemove)
        logger.info({
          location: 'deleteStaleObjects',
          message: `Deleted ${deleted} objects`
        })
      }
      logger.info({
        location: 'deleteStaleObjects',
        message: `Processed ${processedObjectsCount} objects`
      })
    } catch (err) {
      logger.error({
        location: 'deleteStaleObjects',
        message: err
      })
    }
  }

export const deleteMinioObjects = async (
  client: Client,
  bucketName: string,
  batch: {
    name: string
    versionId: string | null
  }[]
) => {
  let deleted = 0

  const deletePromises = batch.map((obj) => {
    if (obj.versionId) {
      return client
        .removeObject(bucketName, obj.name, { versionId: obj.versionId, forceDelete: true })
        .then(() => {
          deleted++
        })
        .catch((err) => {
          logger.error({
            location: 'deleteStaleObjects',
            message: `Failed to remove version ${obj.versionId} of ${obj.name}: ${err}`
          })
        })
    } else {
      return client
        .removeObject(bucketName, obj.name, {
          forceDelete: true
        })
        .then(() => {
          deleted++
        })
        .catch((err) => {
          logger.error({
            location: 'deleteStaleObjects',
            message: `Failed to remove ${obj.name}: ${err}`
          })
        })
    }
  })

  await Promise.all(deletePromises)

  return deleted
}
