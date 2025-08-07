import {
  BaseError,
  EntityTooLargeError,
  ForbiddenError,
  InternalError,
  InvalidDataError,
  NotFoundError,
  UnauthorizedError,
} from '@/domain/errors'
import httpStatus from 'http-status'

type PayloadError = {
  message?: string
  code?: string
  data?: any
}

export class HttpError {
  public readonly statusCode: number
  public readonly isKnownError: boolean
  private error: Error

  constructor(error: Error) {
    this.error = error

    if (!(error instanceof BaseError)) {
      this.isKnownError = false
      this.statusCode = 500
      return
    }

    const baseError = error as BaseError
    this.isKnownError = true

    if (baseError.httpStatus) {
      this.statusCode = baseError.httpStatus
    } else {
      switch (baseError.constructor) {
        case NotFoundError:
          this.statusCode = httpStatus.NOT_FOUND
          break
        case ForbiddenError:
          this.statusCode = httpStatus.FORBIDDEN
          break
        case UnauthorizedError:
          this.statusCode = httpStatus.UNAUTHORIZED
          break
        case InvalidDataError:
          this.statusCode = httpStatus.BAD_REQUEST
          break
        case InternalError:
          this.statusCode = httpStatus.INTERNAL_SERVER_ERROR
          break
        case EntityTooLargeError:
          this.statusCode = httpStatus.REQUEST_ENTITY_TOO_LARGE
          break
        default:
          this.statusCode = 500
      }
    }
  }

  getError(): PayloadError {
    if (this.error instanceof BaseError) {
      return {
        message: this.error.message,
        code: this.error.code,
        data: this.error.data,
      }
    }

    return {
      message: this.error.message,
    }
  }
}
