export const getB64Extension = (b64: string) => {
  const initial = b64.charAt(0)

  switch (initial) {
    case '/':
      return '.jpg'
    case 'i':
      return '.png'
    case 'R':
      return '.gif'
    case 'U':
      return '.webp'
    default:
      return ''
  }
}
