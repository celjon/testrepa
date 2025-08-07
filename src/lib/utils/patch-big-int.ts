const MAX_SAFE = BigInt(Number.MAX_SAFE_INTEGER)
const MIN_SAFE = BigInt(Number.MIN_SAFE_INTEGER)

type PatchedBigInt = bigint & {
  toJSON: () => string | number
}

export const patchBigInt = () => {
  ;(BigInt.prototype as PatchedBigInt).toJSON = function () {
    const value = this as bigint

    if (value > MAX_SAFE || value < MIN_SAFE) {
      return value.toString()
    }

    return Number(value)
  }
}
