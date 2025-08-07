import { AdapterParams } from '@/adapter/types'
import { buildSendWelcomeMail, SendWelcomeMail } from './build-send-welcome-mail'
import { buildSendGiftTokenMail, SendGiftTokenMail } from './build-send-gift-token-mail'
import {
  buildSendPasswordRecoveryMail,
  SendPasswordRecoveryMail,
} from './build-send-password-recovery-mail'
import { buildSendSoftLimitMail, SendSoftLimitMail } from './build-send-soft-limit-mail'
import { buildCompileEmailTemplate, loadPartials } from './compile-email-template'
import { buildSendVerificationMail, SendVerificationMail } from './build-send-verification-mail'
import {
  buildSendUpdateVerificationMail,
  SendUpdateVerificationMail,
} from './send-update-verification-mail'
import {
  buildSendLinksToGeneratedArticlesMail,
  SendLinksToGeneratedArticlesMail,
} from './send-links-to-generated-articles-mail'
import {
  buildSendGiftCertificateMail,
  SendGiftCertificateMail,
} from './build-send-gift-certificate-mail'

type Params = Pick<AdapterParams, 'mail'>

export type MailGateway = {
  sendWelcomeMail: SendWelcomeMail
  sendVerificationMail: SendVerificationMail
  sendEmailUpdateVerificationMail: SendUpdateVerificationMail
  sendGiftTokenMail: SendGiftTokenMail
  sendPasswordRecoveryMail: SendPasswordRecoveryMail
  sendLinksToGeneratedArticlesMail: SendLinksToGeneratedArticlesMail
  sendSoftLimitMail: SendSoftLimitMail
  sendGiftCertificateMail: SendGiftCertificateMail
}
export const buildMailGateway = (params: Params): MailGateway => {
  loadPartials()
  const compileTemplate = buildCompileEmailTemplate()

  return {
    sendWelcomeMail: buildSendWelcomeMail({
      ...params,
      compileTemplate,
    }),
    sendVerificationMail: buildSendVerificationMail({
      ...params,
      compileTemplate,
    }),
    sendEmailUpdateVerificationMail: buildSendUpdateVerificationMail({
      ...params,
      compileTemplate,
    }),
    sendGiftTokenMail: buildSendGiftTokenMail({
      ...params,
      compileTemplate,
    }),
    sendPasswordRecoveryMail: buildSendPasswordRecoveryMail({
      ...params,
      compileTemplate,
    }),
    sendSoftLimitMail: buildSendSoftLimitMail({
      ...params,
      compileTemplate,
    }),
    sendLinksToGeneratedArticlesMail: buildSendLinksToGeneratedArticlesMail({
      ...params,
      compileTemplate,
    }),
    sendGiftCertificateMail: buildSendGiftCertificateMail({ ...params, compileTemplate }),
  }
}
