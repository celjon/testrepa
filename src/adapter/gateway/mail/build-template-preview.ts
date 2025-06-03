import Express from 'express'
import { buildCompileEmailTemplate, loadPartials } from './compile-email-template'
import { getTranlation } from './translation'

export const buildTemplatePreview = () => {
  const router = Express.Router()

  router.use('/email-templates/:template', async (req, res) => {
    let locale = req.query.locale
    if (typeof locale !== 'string' || !locale) {
      locale = 'ru'
    }
    const templateName = req.params.template

    const text = getTemplateText(templateName, locale)

    // reload partials
    loadPartials()
    const compileEmailTemplate = buildCompileEmailTemplate()
    const template = compileEmailTemplate(templateName)
    const html = await template(
      {
        t: text,
        user: {
          email: 'test@test.com',
          password: 'password'
        },
        verificationCode: '123456',
        tokens: 300000
      },
      locale
    )

    res.send(html)
  })

  return router
}

const getTemplateText = (templateName: string, locale?: string) => {
  switch (templateName) {
    case 'welcome-mail.hbs':
      return getTranlation('welcomeMail', locale)

    case 'verification.hbs':
      return getTranlation('verificationMail', locale)

    case 'password-recovery.hbs':
      return getTranlation('passwordRecoveryMail', locale)

    case 'gift-token.hbs':
      return getTranlation('giftTokenMail', locale)

    case 'soft-limit.hbs':
      return getTranlation('softLimitMail', locale)

    default:
      return {}
  }
}
