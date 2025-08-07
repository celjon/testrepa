import { AdapterParams } from '@/adapter/types'

type Params = Pick<AdapterParams, 'ai302'>

export type GetVideoResult = (taskId: string, quality: string) => Promise<any>

export const buildGetVideoResult = ({ ai302 }: Params): GetVideoResult => {
  return async (taskId, quality) => {
    return ai302.client.getVideoResult(taskId, quality)
  }
}
