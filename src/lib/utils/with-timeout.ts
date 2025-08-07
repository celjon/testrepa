export const withTimeout = async <T>(promise: Promise<T>, timeout: number) => {
  const timeoutPromise = new Promise<T>((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new Error(`Timeout of ${timeout}ms exceeded`))
    }, timeout)

    promise.then(
      (result) => {
        clearTimeout(timeoutId)
        resolve(result)
      },
      (error) => {
        clearTimeout(timeoutId)
        reject(error)
      },
    )
  })
  return Promise.race([promise, timeoutPromise])
}
