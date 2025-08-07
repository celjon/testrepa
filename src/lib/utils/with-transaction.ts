type WithTransaction = <T>(
  transactor: {
    inTx: <R>(cb: (tx: any) => Promise<R>, options?: { timeout?: number }) => Promise<R>
  },
  tx: unknown | undefined,
  callback: (tx: any) => Promise<T>,
  options?: { timeout?: number },
) => Promise<T>

export const withTransaction: WithTransaction = async (transactor, tx, callback, options) => {
  if (tx) {
    return callback(tx)
  }
  return transactor.inTx(callback, options)
}
