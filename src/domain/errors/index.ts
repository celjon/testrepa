type ErrorCreateParams = {
  message?: string
  data?: object
  code?: string
  httpStatus?: number
}

export class BaseError extends Error {
  public readonly message: string
  public readonly data?: object
  public readonly code?: string
  public readonly httpStatus?: number

  constructor(
    { message = '', data, code, httpStatus }: ErrorCreateParams = {
      message: '',
    },
  ) {
    super(message)
    this.message = message
    this.data = data
    this.code = code
    this.httpStatus = httpStatus
  }
}

export class NotFoundError extends BaseError {
  constructor(data?: ErrorCreateParams) {
    super(data)
  }
}

export class ForbiddenError extends BaseError {
  constructor(data?: ErrorCreateParams) {
    super(data)
  }
}

export class UnauthorizedError extends BaseError {
  constructor(data?: ErrorCreateParams) {
    super(data)
  }
}

export class InvalidDataError extends BaseError {
  constructor(data?: ErrorCreateParams) {
    super(data)
  }
}

export class InternalError extends BaseError {
  constructor(data?: ErrorCreateParams) {
    super(data)
  }
}

export class EntityTooLargeError extends BaseError {
  constructor(data?: ErrorCreateParams) {
    super(data)
  }
}

export class BanedUserError extends BaseError {
  constructor(data?: ErrorCreateParams) {
    super({
      ...data,
      message: data?.message ?? 'User is banned',
      httpStatus: data?.httpStatus ?? 403,
    })
  }
}

export class TooManyRequestsError extends BaseError {
  constructor(data?: ErrorCreateParams) {
    super({
      ...data,
      httpStatus: 429,
    })
  }
}

export class TimeoutError extends InternalError {
  constructor(data?: ErrorCreateParams) {
    super({
      ...data,
      message: data?.message ?? 'Timeout exceeded',
    })
  }
}
