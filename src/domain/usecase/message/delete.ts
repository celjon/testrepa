import { UseCaseParams } from '@/domain/usecase/types'
import { IMessage } from '@/domain/entity/message'

export type Delete = (data: { userId: string; id: string }) => Promise<IMessage | null>

export const buildDelete = ({ adapter }: UseCaseParams): Delete => {
  return async ({ userId, id }) => {
    const message = await adapter.messageRepository.get({
      where: { id },
      include: {
        images: {
          include: {
            original: { select: { id: true, path: true } },
            preview: { select: { id: true, path: true } },
          },
        },
      },
    })

    if (!message) {
      return null
    }

    const ids: string[] = []
    const paths: string[] = []

    for (const img of message.images || []) {
      if (img.original) {
        ids.push(img.original.id)
        paths.push(img.original.path!)
      }
      if (img.preview) {
        ids.push(img.preview.id)
        paths.push(img.preview.path!)
      }
    }

    const deletedMessage = await adapter.messageRepository.delete({
      where: {
        id,
        user_id: userId,
      },
    })

    if (ids.length) {
      await adapter.storageGateway.deleteFiles(paths)
      await adapter.fileRepository.deleteMany({ where: { id: { in: ids } } })
    }

    return deletedMessage
  }
}
