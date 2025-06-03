export const getErrorString = (error: unknown) => {
  let errorString = JSON.stringify(error)
  if (errorString === '{}' && error instanceof Error) {
    errorString = error.message ?? error.name ?? error.cause
  }

  return errorString
}
