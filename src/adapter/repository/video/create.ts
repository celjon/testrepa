import { AdapterParams } from '@/adapter/types'
import { Prisma } from '@prisma/client'
import { IVideo } from '@/domain/entity/video'

type Params = Pick<AdapterParams, 'db'>

export type Create = (data: Prisma.VideoCreateArgs) => Promise<IVideo | never>

export const buildCreate =
  ({ db }: Params): Create =>
  async (data) => {
    const voice = await db.client.video.create(data)

    return voice as IVideo
  }
