const pngRegex = /\.png$/i
const jpgRegex = /\.jpg$/i
const jpegRegex = /\.jpeg$/i

// Guess if file is an image by checking the file extension
export const isImage = (filename: string) => {
  return pngRegex.test(filename) || jpgRegex.test(filename) || jpegRegex.test(filename)
}
