import { AdapterParams } from '@/adapter/types'
import { ImageToVideoCreateParams } from '@runwayml/sdk/resources/image-to-video'

type Params = Pick<AdapterParams, 'runway'>

export type RunwayGateway = ReturnType<typeof buildRunwayGateway>

export const buildRunwayGateway = ({ runway }: Params) => {
  return {
    imageToVideo: async (params: ImageToVideoCreateParams) => {
      const imageToVideo = await runway.client.imageToVideo.create(params)

      const taskId = imageToVideo.id
      let task
      do {
        await new Promise((resolve) => setTimeout(resolve, 10000))
        task = await runway.client.tasks.retrieve(taskId)
      } while (!['SUCCEEDED', 'FAILED'].includes(task.status))

      if (task.status === 'FAILED') {
        throw new Error('Ошибка генерации видео: ' + task.failure)
      }
      const videoUrl = task.output
      const response = await fetch(videoUrl![0])
      const arrayBuffer = await response.arrayBuffer()
      return { buffer: Buffer.from(arrayBuffer), ext: `.mp4` }
    }
  }
}
