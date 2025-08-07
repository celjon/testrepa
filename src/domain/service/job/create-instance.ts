import { IJob, IJobInstance, JobMap } from '@/domain/entity/job'
import { ChatService } from '../chat'
import { Adapter } from '@/domain/types'
import { JobStatus } from '@prisma/client'
import { BaseError } from '@/domain/errors'

type Params = {
  chatService: ChatService
  jobMap: JobMap
} & Pick<Adapter, 'jobRepository' | 'clusterGateway'>

export type CreateInstance = (params: {
  job: IJob
  onError?: (job: IJob) => unknown
}) => IJobInstance

export const buildCreateInstance =
  ({ jobMap, jobRepository, chatService, clusterGateway }: Params): CreateInstance =>
  ({ job, onError }) => ({
    ...job,
    job,
    stopCallback: null,
    async start({ stop = null } = {}) {
      const { chat } = this.job

      this.stopCallback = stop

      await this.update({
        status: JobStatus.PENDING,
        is_stop_allowed: stop !== null,
      })

      chatService.eventStream.emit({
        chat,
        event: {
          name: 'JOB_START',
          data: {
            job: this.job,
          },
        },
      })

      jobMap[this.id] = this

      return this.job
    },
    async stop({ type = 'process' } = { type: 'process' }) {
      const { chat } = this.job

      if (!this.job.is_stop_allowed) {
        return this.job
      }

      if (type === 'process') {
        clusterGateway.emit('job-stop', null, this.id)

        return this.job
      } else if (type === 'job' && this.stopCallback) {
        this.stopCallback()

        await this.update({
          status: JobStatus.STOPPED,
        })

        chatService.eventStream.emit({
          chat,
          event: {
            name: 'JOB_STOP',
            data: {
              job: this.job,
            },
          },
        })

        delete jobMap[this.id]
      }

      return this.job
    },
    async setProgress(progress) {
      const { chat } = this.job

      await this.update({
        progress,
      })

      chatService.eventStream.emit({
        chat,
        event: {
          name: 'JOB_PROGRESS',
          data: {
            job: this.job,
          },
        },
      })

      return this.job
    },
    async setError(error) {
      const { chat } = this.job

      let jobError: unknown
      let jobErrorCode: string | null = null
      let remainingTimeout: number | null = null
      if (error instanceof BaseError) {
        jobError = error.message ? error.message : error.code
        jobErrorCode = error.code ?? null
        if (jobErrorCode === 'FLOOD_ERROR') {
          remainingTimeout = (error.data as Record<string, number>)?.remainingTimeout
        }
      } else if (error instanceof Error) {
        jobError = error.message ? error.message : error.name
        jobErrorCode = error.name
      } else if (typeof error === 'string') {
        jobError = error
      } else if (
        typeof error === 'object' &&
        error !== null &&
        'error' in error &&
        typeof error.error === 'object' &&
        error.error !== null &&
        'message' in error.error &&
        typeof error.error.message === 'string'
      ) {
        jobError = error.error.message
      } else if (
        typeof error === 'object' &&
        error !== null &&
        'message' in error &&
        typeof error.message === 'string'
      ) {
        jobError = error.message
      } else {
        jobError = 'Job error'
      }

      await this.update({
        status: JobStatus.ERROR,
        ...((typeof jobError === 'string' ||
          (typeof jobError === 'object' && jobError !== null)) && {
          error: jobError,
          error_code: jobErrorCode,
          ...(typeof remainingTimeout === 'number' && {
            mj_remaining_timeout: remainingTimeout,
          }),
        }),
      })

      chatService.eventStream.emit({
        chat,
        event: {
          name: 'JOB_ERROR',
          data: {
            job: this.job,
          },
        },
      })

      onError?.(this.job)

      delete jobMap[this.id]

      return this.job
    },
    async done() {
      const { chat } = this.job

      await this.update({
        status: JobStatus.DONE,
        progress: 100,
      })

      chatService.eventStream.emit({
        chat,
        event: {
          name: 'JOB_DONE',
          data: {
            job: this.job,
          },
        },
      })

      delete jobMap[this.id]

      return this.job
    },
    async update(params) {
      const { chat } = this.job

      this.job =
        (await jobRepository.update({
          where: {
            id: this.job.id,
          },
          data: params,
        })) ?? this.job
      this.job.chat = chat

      for (const paramKey of Object.keys(params)) {
        // @ts-ignore
        this[paramKey] = this.job[paramKey]
      }

      chatService.eventStream.emit({
        chat,
        event: {
          name: 'JOB_UPDATE',
          data: {
            job: this.job,
          },
        },
      })

      return this.job
    },
    async delete() {
      const { chat } = this.job

      await jobRepository.delete({
        where: {
          id: this.job.id,
        },
      })

      chatService.eventStream.emit({
        chat,
        event: {
          name: 'JOB_DELETE',
          data: {
            job: this.job,
          },
        },
      })

      delete jobMap[this.id]

      return this.job
    },
  })
