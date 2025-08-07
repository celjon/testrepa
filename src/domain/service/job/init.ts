import { Adapter } from '@/domain/types'
import cluster from 'cluster'
import { Get } from './get'
import { JobStatus } from '@prisma/client'

type Params = {
  get: Get
} & Pick<Adapter, 'jobRepository' | 'clusterGateway'>

export type Init = () => Promise<void>

export const buildInit =
  ({ jobRepository, clusterGateway, get }: Params): Init =>
  async () => {
    if (cluster.isPrimary) {
      const workers = clusterGateway.getWorkers()

      clusterGateway.on(
        'job-stop',
        async (jobId) => {
          const workers = clusterGateway.getWorkers()

          clusterGateway.emit('job-stop', workers, jobId)

          const job = await get({
            id: jobId,
          })

          if (!job) {
            return
          }

          job.stop({
            type: 'job',
          })
        },
        workers,
      )

      await jobRepository.updateMany({
        where: {
          status: {
            in: [JobStatus.CREATED, JobStatus.PENDING],
          },
        },
        data: {
          status: JobStatus.DONE,
        },
      })
    }
    if (cluster.isWorker) {
      clusterGateway.on('job-stop', async (jobId) => {
        const job = await get({
          id: jobId,
        })

        if (!job) {
          return
        }

        job.stop({
          type: 'job',
        })
      })
    }
  }
