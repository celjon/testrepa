import { Field, ID, ObjectType } from 'type-graphql'
import { Video } from '@prisma/client'
import { FileGraphQLObject, IFile } from './file'

export interface IVideo extends Video {
  file?: IFile
}

@ObjectType('Video')
export class VideoGraphQLObject implements IVideo {
  @Field(() => ID)
  id!: string

  @Field(() => String)
  content!: string

  @Field(() => Number, { defaultValue: 0, deprecationReason: 'use duration_seconds' })
  duration!: number

  @Field(() => Number)
  duration_seconds!: number

  @Field(() => Boolean)
  isEncrypted!: boolean

  @Field(() => ID, { nullable: true })
  file_id!: string | null

  @Field(() => FileGraphQLObject)
  file!: IFile
}
