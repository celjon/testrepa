import CyrillicToTranslit from 'cyrillic-to-translit-js'

 
// @ts-expect-error
const translit = new CyrillicToTranslit({ preset: 'ru' })

export const slugification = (text: string): string => {
  return translit.transform(text, '_').toLowerCase()
}
