export const gcd = (a: number, b: number) => {
  while (a !== 0 && b !== 0) {
    if (a > b) {
      a %= b
    } else {
      b %= a
    }
  }
  if (a === 0) return b

  return a
}
