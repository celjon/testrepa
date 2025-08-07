import { gcd } from './gcd'

export const arrayGcd = (arr: Array<number>) => {
  if (arr.length === 1) {
    return arr[0]
  }

  let result = gcd(arr[0], arr[1])

  for (let i = 2; i < arr.length; i++) {
    result = gcd(result, arr[i])
  }

  return result
}
