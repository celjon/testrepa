import { IVoice } from '@/domain/entity/voice'
import { AdapterParams } from '@/adapter/types'
import { Prisma } from '@prisma/client'

type Params = Pick<AdapterParams, 'db'>

export type Create = (data: Prisma.VoiceCreateArgs) => Promise<IVoice | never>

export const buildCreate =
  ({ db }: Params): Create =>
  async (data) => {
    const voice = await db.client.voice.create(data)

    return voice as IVoice
  }
