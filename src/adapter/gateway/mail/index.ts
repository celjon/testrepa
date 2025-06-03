import { AdapterParams } from '@/adapter/types'
import { buildSendWelcomeMail, SendWelcomeMail } from './build-send-welcome-mail'
import { buildSendGiftTokenMail, SendGiftTokenMail } from './build-send-gift-token-mail'
import { buildSendPasswordRecoveryMail, SendPasswordRecoveryMail } from './build-send-password-recovery-mail'
import { buildSendSoftLimitMail, SendSoftLimitMail } from './build-send-soft-limit-mail'
import { loadPartials } from './compile-email-template'
import { buildSendVerificationMail, SendVerificationMail } from './build-send-verification-mail'
import { buildSendUpdateVerificationMail, SendUpdateVerificationMail } from './send-update-verification-mail'
import {
  buildSendLinksToGeneratedArticlesMail,
  SendLinksToGeneratedArticlesMail
} from '@/adapter/gateway/mail/send-links-to-generated-articles-mail'

type Params = Pick<AdapterParams, 'mail'>

export type MailGateway = {
  sendWelcomeMail: SendWelcomeMail
  sendVerificationMail: SendVerificationMail
  sendEmailUpdateVerificationMail: SendUpdateVerificationMail
  sendGiftTokenMail: SendGiftTokenMail
  sendPasswordRecoveryMail: SendPasswordRecoveryMail
  sendLinksToGeneratedArticlesMail: SendLinksToGeneratedArticlesMail
  sendSoftLimitMail: SendSoftLimitMail
}
export const buildMailGateway = (params: Params): MailGateway => {
  loadPartials()

  const sendWelcomeMail = buildSendWelcomeMail(params)
  const sendVerificationMail = buildSendVerificationMail(params)
  const sendEmailUpdateVerificationMail = buildSendUpdateVerificationMail(params)
  const sendGiftTokenMail = buildSendGiftTokenMail(params)
  const sendPasswordRecoveryMail = buildSendPasswordRecoveryMail(params)
  const sendSoftLimitMail = buildSendSoftLimitMail(params)
  const sendLinksToGeneratedArticlesMail = buildSendLinksToGeneratedArticlesMail(params)

  return {
    sendWelcomeMail,
    sendVerificationMail,
    sendEmailUpdateVerificationMail,
    sendGiftTokenMail,
    sendPasswordRecoveryMail,
    sendSoftLimitMail,
    sendLinksToGeneratedArticlesMail
  }
}
