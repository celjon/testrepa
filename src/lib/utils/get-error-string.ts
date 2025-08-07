import { BaseError } from '@/domain/errors'
import { isAxiosError } from 'axios'

export const getErrorString = (error: unknown) => {
  if (error instanceof BaseError) {
    return JSON.stringify({
      code: error.code,
      message: error.message,
      data: error.data,
      name: error.name,
      cause: error.cause,
      stack: error.stack,
    })
  }

  if (isAxiosError(error)) {
    return JSON.stringify({
      data: error.response?.data instanceof Buffer ? 'Buffer' : error.response?.data,
      code: error.code,
      status: error.status,
      config: {
        method: error.config?.method,
        url: error.config?.url,
        data: error.config?.data,
      },
    })
  }

  let errorString = JSON.stringify(error)
  if (errorString === '{}' && error instanceof Error) {
    errorString = error.message ?? error.name ?? error.cause
  }

  return errorString
}
