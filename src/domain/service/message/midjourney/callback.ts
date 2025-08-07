import { IChat } from '@/domain/entity/chat'
import { IJobInstance } from '@/domain/entity/job'
import { ChatService } from '../../chat'
import { Adapter } from '@/adapter'
import axios from 'axios'
import { randomUUID } from 'crypto'
import { FileType, MessageImageStatus } from '@prisma/client'
import { IMessageImage } from '@/domain/entity/message-image'

type Params = Adapter & {
  chatService: ChatService
}

export type Callback = (params: {
  mjJob: IJobInstance
  chat: IChat
  messageId: string
}) => (params: { url?: string; progress: string }) => Promise<void>

export const buildCallback = ({ imageGateway, chatService }: Params): Callback => {
  return ({ mjJob, chat, messageId }) => {
    return async ({ url, progress }) => {
      await mjJob.setProgress(Number(progress.split('%')[0]))

      const images: IMessageImage[] = []

      if (url) {
        const { data: imageBuffer } = await axios<Buffer>({
          method: 'get',
          url,
          responseType: 'arraybuffer',
        })

        const { width: imageWidth = 2048, height: imageHeight = 2048 } =
          await imageGateway.metadata({
            buffer: imageBuffer,
          })

        const messageImageId = randomUUID()
        const mjImageId = randomUUID()
        const mjPreviewImageId = randomUUID()

        images.push({
          id: messageImageId,
          status: MessageImageStatus.PENDING,
          message_id: messageId,
          width: imageWidth,
          height: imageHeight,
          preview_width: imageWidth,
          preview_height: imageHeight,
          original_id: mjImageId,
          original: {
            id: mjImageId,
            type: FileType.IMAGE,
            name: null,
            url,
            path: null,
            size: 0,
            created_at: new Date(),
            deleted_at: null,
            isEncrypted: false,
          },
          is_nsfw: false,
          preview_id: mjPreviewImageId,
          preview: {
            id: mjPreviewImageId,
            type: FileType.IMAGE,
            name: null,
            url,
            path: null,
            size: 0,
            created_at: new Date(),
            deleted_at: null,
            isEncrypted: false,
          },
          created_at: new Date(),
        })
      }

      chatService.eventStream.emit({
        chat,
        event: {
          name: 'MESSAGE_UPDATE',
          data: {
            message: {
              id: messageId,
              job_id: mjJob.id,
              job: mjJob.job,
              images,
            },
          },
        },
      })
    }
  }
}
