import { NextFunction, Request, Response } from 'express'
import httpStatus from 'http-status'
import { JwtPayload } from 'jsonwebtoken'
import { Role } from '@prisma/client'
import { verifyJWT } from '@/lib'
import { Adapter } from '@/domain/types'

type Params = Pick<Adapter, 'developerKeyRepository' | 'userRepository'>

export type AuthRequiredMiddleware = (params?: {
  adminOnly?: boolean
  developerOnly?: boolean
  required?: boolean
}) => (res: Request, req: Response, next: NextFunction) => void

export const buildAuthRequired = ({ developerKeyRepository, userRepository }: Params): AuthRequiredMiddleware => {
  return ({ developerOnly = false, adminOnly = false, required = true } = {}) => {
    return async (req, res, next) => {
      const token = req.headers.authorization?.split(' ')[1]

      if (required && !token) {
        return res.status(httpStatus.UNAUTHORIZED).json({
          error: {
            message: 'UNAUTHORIZED'
          }
        })
      }

      const tokenPayload = token
        ? (verifyJWT(token) as JwtPayload & {
            id: string
            isDeveloper: boolean
            keyEncryptionKey: string | null
          })
        : null

      if (required && !tokenPayload?.id) {
        return res.status(httpStatus.UNAUTHORIZED).json({
          error: {
            message: 'UNAUTHORIZED'
          }
        })
      }

      if (developerOnly && !tokenPayload?.isDeveloper) {
        return res.status(httpStatus.FORBIDDEN).json({
          error: {
            message: 'Please provide a valid DEVELOPER key'
          }
        })
      }

      if (tokenPayload?.isDeveloper) {
        const key = await developerKeyRepository.get({
          where: {
            key: token
          }
        })

        if (key?.deleted) {
          return res.status(httpStatus.FORBIDDEN).json({
            error: {
              message: 'Please provide a valid DEVELOPER key'
            }
          })
        }
      }

      if (adminOnly) {
        const user = await userRepository.get({
          where: {
            id: tokenPayload?.id
          }
        })

        if (!user) {
          return res.status(httpStatus.UNAUTHORIZED).json({
            error: {
              code: 'USER_NOT_FOUND',
              message: 'UNAUTHORIZED'
            }
          })
        }

        if (user.role !== Role.ADMIN) {
          return res.status(httpStatus.UNAUTHORIZED).json({
            error: {
              code: 'YOU_ARE_NOT_ADMIN',
              message: 'UNAUTHORIZED'
            }
          })
        }
      }

      // @ts-ignore
      req.user = {
        id: tokenPayload?.id,
        keyEncryptionKey: tokenPayload?.keyEncryptionKey ?? null
      }
      next()
    }
  }
}
