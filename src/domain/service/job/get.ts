import { IJobInstance, JobMap } from '@/domain/entity/job'
import { Adapter } from '@/domain/types'
import { CreateInstance } from './createInstance'

type Params = {
  createInstance: CreateInstance
  jobMap: JobMap
} & Adapter

export type Get = (params: { id: string }) => Promise<IJobInstance | null>

export const buildGet =
  ({ jobMap }: Params): Get =>
  async ({ id }) =>
    jobMap[id] ?? null
