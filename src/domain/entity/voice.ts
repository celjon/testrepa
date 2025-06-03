import { Field, ID, ObjectType } from 'type-graphql'
import { Prisma, Voice } from '@prisma/client'
import { FileGraphQLObject, IFile } from './file'

export interface IVoice extends Voice {
  file?: IFile
}

@ObjectType('Voice')
export class VoiceGraphQLObject implements IVoice {
  @Field(() => ID)
  id!: string

  @Field(() => String)
  content!: string

  @Field(() => [Number], { nullable: true })
  wave_data!: Prisma.JsonValue

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
