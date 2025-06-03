import { Field, ID, ObjectType } from 'type-graphql'
import { File, FileType } from '@prisma/client'
import { IAttachment } from './message'
import { URL } from 'url'
import { MINIO_STORAGE } from '@/adapter/consts'
import { config } from '@/config'

export interface IFile extends File {
  attachments?: Array<IAttachment>
}

export interface RawFile {
  size: number
  originalname: string
  buffer: Buffer
  mimetype: string
}

export interface RawFileWithoutBuffer {
  size: number
  originalname: string
  path: string
}

export const getFileURL = (file: Pick<IFile, 'path'>) => new URL(`https://${config.minio.host}/${MINIO_STORAGE}/${file.path}`)

@ObjectType('File')
export class FileGraphQLObject implements IFile {
  @Field(() => ID)
  id!: string

  @Field(() => FileType, { nullable: true })
  type!: FileType | null

  @Field(() => String, { nullable: true })
  name!: string | null

  @Field(() => String, { nullable: true })
  url!: string | null

  @Field(() => String, { nullable: true })
  path!: string | null

  @Field(() => Number)
  size!: number

  @Field(() => Boolean)
  isEncrypted!: boolean

  @Field(() => Date)
  created_at!: Date
}
