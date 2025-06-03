import crypto from 'crypto'

export function getRandom6DigitNumber() {
  const array = new Uint32Array(1)
  crypto.getRandomValues(array)
  const randomNumber = array[0] % 1000000
  return randomNumber.toString().padStart(6, '0')
}
