export class CreatePaymentError extends Error {
  public message: string
  public details: string
  public errorCode: string

  constructor({
    errorCode,
    message,
    details,
  }: {
    errorCode: string
    message: string
    details: string
  }) {
    super(message)

    this.message = message
    this.details = details
    this.errorCode = errorCode
  }
}
