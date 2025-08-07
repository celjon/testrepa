export async function runWithConcurrencyLimit<T, R>(
  poolLimit: number,
  array: T[],
  iteratorFn: (item: T) => Promise<R>,
): Promise<R[]> {
  const ret: Promise<R>[] = []
  const executing: Promise<void>[] = []
  for (const item of array) {
    const p = Promise.resolve().then(() => iteratorFn(item))
    ret.push(p)

    const e = p.then(() => void 0)
    executing.push(e)

    if (executing.length >= poolLimit) {
      await Promise.race(executing)
      executing.splice(
        executing.findIndex((x) => x === e),
        1,
      )
    }
  }
  await Promise.all(executing)
  return Promise.all(ret)
}
