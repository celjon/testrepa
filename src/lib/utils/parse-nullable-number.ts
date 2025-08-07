export const parseNullableNumber = (value: any) => {
  if (value === undefined) {
    return undefined
  }

  if (value === 'null') {
    return null
  }

  return Number(value)
}
