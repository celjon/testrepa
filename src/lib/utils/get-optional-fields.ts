export const getOptionalFields = <D extends Record<string, any>>(
  names: Array<keyof D>,
  obj: D,
): Partial<D> => {
  const result: Partial<D> = {}
  for (let i = 0; i < names.length; i++) {
    const field = obj[names[i]]
    if (field) {
      // @ts-ignore
      result[names[i]] = field
    }
  }
  return result
}
