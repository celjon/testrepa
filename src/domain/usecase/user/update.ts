import { FileType } from '@prisma/client'
import { extname } from 'path'
import { InvalidDataError, NotFoundError, UnauthorizedError } from '@/domain/errors'
import { IUser } from '@/domain/entity/user'
import { RawFile } from '@/domain/entity/file'
import { UseCaseParams } from '@/domain/usecase/types'

export type Update = (params: {
  userId?: string
  name?: string
  avatar?: RawFile
  email: string
  verificationCode?: string
}) => Promise<IUser | never>
export const buildUpdate = ({ adapter }: UseCaseParams): Update => {
  return async ({ userId, name, avatar, email, verificationCode }) => {
    const user = await adapter.userRepository.get({
      omit: {
        kekSalt: true,
        encryptedDEK: true,
        password: true
      },
      where: {
        id: userId
      }
    })

    if (!user) {
      throw new NotFoundError({
        code: 'USER_NOT_FOUND'
      })
    }

    let avatarUrl = user.avatar
    let avatarId = user.avatar_id

    if (avatar && (avatar.originalname.match(/.png$/i) || avatar.originalname.match(/.jpg$/i) || avatar.originalname.match(/.jpeg$/i))) {
      const resizedImage = await adapter.imageGateway.resize({
        buffer: avatar.buffer,
        height: 256,
        width: 256
      })

      const writeResult = await adapter.storageGateway.write({
        buffer: resizedImage.buffer,
        ext: extname(avatar.originalname)
      })
      const avatarFile = await adapter.fileRepository.create({
        data: {
          type: FileType.IMAGE,
          path: writeResult.path
        }
      })

      avatarUrl = writeResult.url
      avatarId = avatarFile.id
    }
    if (email && email !== user.email && verificationCode) {
      const code = await adapter.verificationCodeRepository.get({
        where: {
          code: verificationCode,
          user_id: userId
        },
        include: {
          user: true
        }
      })
      if (!code) {
        throw new NotFoundError({
          code: 'VERIFICATION_CODE_NOT_FOUND'
        })
      }

      if (new Date() > code.expires_at) {
        await adapter.verificationCodeRepository.delete({
          where: { id: code.id }
        })

        throw new InvalidDataError({
          code: 'VERIFICATION_CODE_EXPIRED'
        })
      }

      if (!user || user.disabled) {
        throw new UnauthorizedError()
      }

      await adapter.userRepository.update({
        where: { id: user.id },
        data: {
          email
        }
      })
      await adapter.verificationCodeRepository.delete({
        where: { id: code.id }
      })
    }

    const updateUser = await adapter.userRepository.update({
      where: {
        id: userId
      },
      data: {
        name: name ?? user.name,
        avatar: avatarUrl,
        avatar_id: avatarId
      },
      omit: {
        kekSalt: true,
        encryptedDEK: true,
        password: true
      },
    })

    if (!updateUser) {
      throw new NotFoundError({
        code: 'USER_NOT_FOUND'
      })
    }

    return updateUser
  }
}
