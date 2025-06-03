import { UseCaseParams } from '@/domain/usecase/types'
import { IMessage } from '@/domain/entity/message'
import { NotFoundError } from '@/domain/errors'

export type Get = (data: { userId: string; keyEncryptionKey: string | null; id: string }) => Promise<IMessage>

export const buildGet = ({ service, adapter }: UseCaseParams): Get => {
  return async ({ userId, keyEncryptionKey, id }) => {
    const user = await adapter.userRepository.get({
      where: {
        id: userId
      }
    })

    if (!user) {
      throw new NotFoundError({
        code: 'USER_NOT_FOUND'
      })
    }

    const message = await service.message.storage.get({
      user,
      keyEncryptionKey,
      data: {
        where: {
          id,
          user_id: userId
        },
        orderBy: {
          created_at: 'desc'
        },
        include: {
          user: true,
          model: {
            include: {
              icon: true,
              parent: {
                include: {
                  icon: true
                }
              }
            }
          },
          set: true,
          transaction: true,
          images: {
            include: {
              original: true,
              preview: true,
              buttons: true
            }
          },
          buttons: {
            where: {
              disabled: false
            }
          },
          all_buttons: {
            distinct: ['action']
          },
          attachments: {
            include: {
              file: true
            }
          },
          voice: {
            include: {
              file: true
            }
          },
          video: {
            include: {
              file: true
            }
          }
        }
      }
    })

    if (!message) {
      throw new NotFoundError()
    }

    return message
  }
}
