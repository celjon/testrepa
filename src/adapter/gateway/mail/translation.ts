import { translations } from './translations'

export type Translation = {
  indexLayout: {
    header: {
      title: string
    }

    midjourney: {
      title: string
      subtitle: string
      tryMidjourney: string
    }

    footer: {
      companyName: string
      pricing: string
      forInvestors: string
      forBusiness: string
      contacts: string
    }
  }

  welcomeMailSubject: string
  welcomeMail: {
    title: string
    subtitle: string
    profile: string
  }

  verificationMailSubject: string
  verificationMail: {
    title: string
    subtitle: string
    yourCode: string
  }
  updateVerificationMailSubject: string
  updateVerificationMail: {
    title: string
    subtitle: string
    yourCode: string
  }
  generatedArticlesLinksMailSubject: string
  generatedArticlesLinksMail: {
    title: string
  }

  giftTokenMailSubject: string
  giftTokenMail: {
    title: string
    body1: string
    body2: string
    body3: string
    bottomText1: string
    bottomText2: string
    auth: string
  }

  passwordRecoveryMailSubject: string
  passwordRecoveryMail: {
    title: string
    subtitle: string
    resetPassword: string
    bottomText: string
  }

  softLimitMailSubject: string
  softLimitMail: {
    title: string
    subtitle: string
    body1: string
    body2: string
    body3: string
    body4: string
  }
}

export type Locale = 'en' | 'es' | 'fr' | 'pt' | 'ru'

export const getTranlation = <K extends keyof Translation>(section: K, locale?: string) => {
  switch (locale) {
    case 'en':
      return withFallback(translations.en[section], section)

    case 'es':
      return withFallback(translations.es[section], section)

    case 'fr':
      return withFallback(translations.fr[section], section)

    case 'pt':
      return withFallback(translations.pt[section], section)

    default:
      return translations.ru[section]
  }
}

const withFallback = <S extends keyof Translation>(value: Translation[keyof Translation] | undefined, section: S): Translation[S] => {
  if (value) {
    return value as Translation[S]
  }

  return translations.en[section] || translations.ru[section]
}
