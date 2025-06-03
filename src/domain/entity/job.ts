import { Field, ID, ObjectType } from 'type-graphql'
import { Job, JobStatus, Prisma } from '@prisma/client'
import { IMessage } from './message'
import { ChatGraphQLObject, IChat } from './chat'

export { JobStatus } from '@prisma/client'

export type StopJobCallback = () => void

export type StartJobFunction = (
  this: IJobInstance,
  params?: {
    stop?: StopJobCallback
  }
) => Promise<IJob>

export type StopJobType = 'job' | 'process'

export type StopJobFunction = (
  this: IJobInstance,
  params?: {
    type?: StopJobType
  }
) => Promise<IJob>

export type SetJobProgressFunction = (this: IJobInstance, progress: number | null) => Promise<IJob>

export type SetJobErrorFunction = (this: IJobInstance, error: unknown) => Promise<IJob>

export type DoneJobFunction = (this: IJobInstance) => Promise<IJob>

export type UpdateJobFunction = (this: IJobInstance, params: Prisma.JobUpdateInput) => Promise<IJob>

export type DeleteJobFunction = (this: IJobInstance) => Promise<IJob>

/**
 * @openapi
 * components:
 *   entities:
 *      Job:
 *          required:
 *            - id
 *            - name
 *            - status
 *          properties:
 *            id:
 *                type: string
 *            name:
 *                type: string
 *            status:
 *                type: string
 */

export interface IJob extends Job {
  chat: IChat
  message?: IMessage | null
  user_message?: IMessage | null
}

export type IJobInstance = Omit<IJob, 'timeout'> & {
  job: IJob
  start: StartJobFunction
  stop: StopJobFunction
  stopCallback: StopJobCallback | null
  setProgress: SetJobProgressFunction
  setError: SetJobErrorFunction
  done: DoneJobFunction
  update: UpdateJobFunction
  delete: DeleteJobFunction
}

export type JobMap = Record<string, IJobInstance>

@ObjectType('Job')
export class JobGraphQLObject implements IJob {
  @Field(() => ID)
  id!: string

  @Field(() => String)
  name!: string

  @Field(() => JobStatus)
  status!: JobStatus

  @Field(() => Boolean)
  is_stop_allowed!: boolean

  @Field(() => Number)
  timeout!: number

  @Field(() => Number, { nullable: true })
  progress!: number | null

  @Field(() => Object, { nullable: true })
  error!: any

  @Field(() => String, { nullable: true })
  error_code!: string | null

  @Field(() => ID, { nullable: true })
  chat_id!: string | null

  @Field(() => ChatGraphQLObject)
  chat!: IChat

  @Field(() => ID, { nullable: true })
  user_message_id!: string | null

  @Field(() => ID, { nullable: true })
  mj_native_message_id!: string | null

  @Field(() => Number, { nullable: true })
  mj_remaining_timeout!: number | null

  @Field(() => Date)
  created_at!: Date
}
