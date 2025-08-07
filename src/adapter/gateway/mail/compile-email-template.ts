import fs from 'fs'
import path from 'path'
import Handlebars from 'handlebars'
import inlineCSS from 'inline-css'
import { config } from '@/config'
import { getTargetLocale, getTranslation, Translation } from './translation'

Handlebars.registerHelper('if_eq', function (a, b, opts) {
  if (a == b) {
    // @ts-ignore
    return opts.fn(this)
  } else {
    // @ts-ignore
    return opts.inverse(this)
  }
})

Handlebars.registerHelper('if_neq', function (a, b, opts) {
  if (a != b) {
    // @ts-ignore
    return opts.fn(this)
  } else {
    // @ts-ignore
    return opts.inverse(this)
  }
})

const loadFile = (templateName: string) => {
  return fs.readFileSync(path.join(process.cwd(), `/email-templates/${templateName}`), 'utf8')
}

export const loadPartials = () => {
  const header = loadFile('partials/header.hbs')
  const footer = loadFile('partials/footer.hbs')

  const bothubLogoCard = loadFile('partials/bothub-logo-card.hbs')
  const lockCard = loadFile('partials/lock-card.hbs')
  const giftCard = loadFile('partials/gift-card.hbs')
  const midjourneySection = loadFile('partials/midjourney.hbs')

  Handlebars.registerPartial('header', header)
  Handlebars.registerPartial('footer', footer)

  Handlebars.registerPartial('bothub-logo-card', bothubLogoCard)
  Handlebars.registerPartial('lock-card', lockCard)
  Handlebars.registerPartial('gift-card', giftCard)
  Handlebars.registerPartial('midjourney', midjourneySection)
}

const compileTemplate = <TemplateParams>(templateName: string) => {
  const templateString = loadFile(templateName)

  return Handlebars.compile<TemplateParams>(templateString)
}

type TemplateConfig = {
  realAddress: string
  frontendAddress: string
  locale: string
}

type IndexLayoutParams = {
  config: TemplateConfig

  t: Translation['indexLayout']
  body: string
}

export type CompileTemplate = <TemplateParams>(
  templateName: string,
) => (params: TemplateParams, locale?: string) => Promise<string>

export const buildCompileEmailTemplate = (): CompileTemplate => {
  const layoutTemplate = compileTemplate<IndexLayoutParams>('layouts/index.hbs')

  const conf: TemplateConfig = {
    realAddress: config.http.real_address,
    frontendAddress: config.frontend.address,
    locale: config.frontend.default_locale,
  }

  return <TemplateParams>(templateName: string) => {
    const bodyTemplate = compileTemplate<TemplateParams>(templateName)

    return (params: TemplateParams, locale?: string) => {
      const targetLocale = getTargetLocale(locale)

      const html = layoutTemplate({
        body: bodyTemplate({
          ...params,
          config: {
            ...conf,
            locale: targetLocale,
          },
        }),

        config: {
          ...conf,
          locale: targetLocale,
        },

        t: getTranslation('indexLayout', targetLocale),
      })

      // styles must be inlined to work in emails
      return inlineCSS(html, {
        url: '/',
        preserveMediaQueries: true,
      })
    }
  }
}
