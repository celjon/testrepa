import { config } from '@/config'

export const getLocale = (header: string | undefined) => {
  if (!header) {
    return config.frontend.default_locale
  }

  const languages = header.split(',')

  // Parse each language tag and store with its quality value
  const languagePreferences = languages.map((lang) => {
    const [langCode, quality] = lang.trim().split('q=')
    return {
      code: langCode.split('-')[0].toLowerCase(),
      quality: quality ? parseFloat(quality) : 1.0,
    }
  })

  // Sort by quality value in descending order
  languagePreferences.sort((a, b) => b.quality - a.quality)

  return languagePreferences[0].code
}
