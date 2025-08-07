import { check, header, query } from 'express-validator'
import { Middlewares } from '../../middlewares'

export const buildAuthRules = ({ authRequired, validateSchema }: Middlewares) => {
  /**
   * @openapi
   * components:
   *   rules:
   *      getOAuthConsentURL:
   *          required:
   *             - provider
   *             - redirect_uri
   *          properties:
   *             provider:
   *                in: query
   *                type: string
   *             redirect_uri:
   *                in: query
   *                type: string
   */
  const getOAuthConsentURLRules = [
    query('provider').exists().notEmpty().isString(),
    query('redirect_uri').exists().notEmpty().isString(),
    validateSchema,
  ]

  /**
   * @openapi
   * components:
   *   rules:
   *      oauthAuthorize:
   *          required:
   *             - provider
   *             - code
   *          properties:
   *             provider:
   *                type: string
   *             code:
   *                type: string
   *             device_id:
   *                type: string
   *             code_verifier:
   *                type: string
   *             redirect_uri:
   *                type: string
   *             yandexMetricClientId:
   *                type: string
   *                nullable: true
   *             yandexMetricYclid:
   *                type: string
   *                nullable: true
   */
  const oauthAuthorizationRules = [
    check('provider').exists().notEmpty().isString(),
    check('code').exists().isString(),
    check('device_id').optional().isString(),
    check('code_verifier').optional().isString(),
    check('redirect_uri').exists().notEmpty().isString(),
    check('fingerprint').optional().isString(),
    check('yandexMetricClientId').optional({ nullable: true }).isString(),
    check('yandexMetricYclid').optional({ nullable: true }).isString(),
    validateSchema,
  ]

  const fingerprintAuthorizationRules = [
    check('fingerprint').exists().notEmpty().isString(),
    check('yandexMetricClientId').optional({ nullable: true }).isString(),
    check('yandexMetricYclid').optional({ nullable: true }).isString(),
    validateSchema,
  ]

  /**
   * @openapi
   * components:
   *   rules:
   *      authorization:
   *          required:
   *             - email
   *             - password
   *          properties:
   *             email:
   *                type: string
   *             password:
   *                type: string
   *             yandexMetricClientId:
   *                type: string
   *                nullable: true
   *             yandexMetricYclid:
   *                type: string
   *                nullable: true
   */
  const authorizationRules = [
    check('email').exists().isEmail(),
    check('password').exists().notEmpty().isString(),
    check('fingerprint').optional().isString(),
    check('yandexMetricClientId').optional({ nullable: true }).isString(),
    check('yandexMetricYclid').optional({ nullable: true }).isString(),
    validateSchema,
  ]

  /**
   * @openapi
   * components:
   *   rules:
   *      sendResetLink:
   *          required:
   *             - email
   *          properties:
   *             email:
   *                type: string
   */
  const sendResetLinkRules = [check('email').exists().isEmail(), validateSchema]

  /**
   * @openapi
   * components:
   *   rules:
   *      resetPassword:
   *          required:
   *             - password
   *             - token
   *          properties:
   *             password:
   *                type: string
   *             token:
   *                type: string
   */
  const resetPasswordRules = [check('password').exists(), check('token').exists(), validateSchema]

  /**
   * @openapi
   * components:
   *   rules:
   *      telegramAuthorize:
   *          required:
   *             - name
   *             - tg_id
   *          properties:
   *             name:
   *                type: string
   *             tg_id:
   *                type: string
   *             yandexMetricClientId:
   *                type: string
   *                nullable: true
   *             yandexMetricYclid:
   *                type: string
   *                nullable: true
   */
  const telegramAuthorizationRules = [
    check('tg_id').optional().isString(),
    check('name').exists().notEmpty().isString(),
    check('id').optional().isString(),
    check('invitedBy').optional().isString(),
    header('botsecretkey').exists().notEmpty().isString(),
    check('yandexMetricClientId').optional({ nullable: true }).isString(),
    check('yandexMetricYclid').optional({ nullable: true }).isString(),
    validateSchema,
  ]

  /**
   * @openapi
   * components:
   *   rules:
   *      refreshToken:
   *          required:
   *             - refreshToken
   *             - accessToken
   *          properties:
   *             refreshToken:
   *                type: string
   *             accessToken:
   *                type: string
   */
  const refreshRules = [
    check('refreshToken').exists().notEmpty().isString(),
    check('accessToken').exists().notEmpty().isString(),
    validateSchema,
  ]

  /**
   * @openapi
   * components:
   *   rules:
   *      refreshToken:
   *          required:
   *             - refreshToken
   *          properties:
   *             refreshToken:
   *                type: string
   */
  const logoutRules = [
    authRequired({}),
    check('refreshToken').exists().notEmpty().isString(),
    validateSchema,
  ]

  const logoutAllRules = [
    authRequired({}),
    header('authorization').exists().notEmpty().isString(),
    validateSchema,
  ]

  const getMeRules = [
    header('authorization').exists().notEmpty().isString(),
    authRequired({}),
    validateSchema,
  ]

  const generateTelegramConnectionTokenRules = [
    header('authorization').exists().notEmpty().isString(),
    authRequired({}),
    validateSchema,
  ]

  /**
   * @openapi
   * components:
   *   rules:
   *      connectTelegram:
   *          required:
   *             - telegramConnectionToken
   *          properties:
   *             telegramConnectionToken:
   *                type: string
   */
  const connectTelegramRules = [
    header('authorization').exists().notEmpty().isString(),
    authRequired({}),
    check('telegramConnectionToken').exists().notEmpty().isString(),
    validateSchema,
  ]

  const generateTelegramUnlinkTokenRules = [
    header('authorization').exists().notEmpty().isString(),
    authRequired({}),
    validateSchema,
  ]

  /**
   * @openapi
   * components:
   *   rules:
   *      unlinkTelegram:
   *          required:
   *             - telegramUnlinkToken
   *          properties:
   *             telegramUnlinkToken:
   *                type: string
   */
  const unlinkTelegramRules = [
    header('authorization').exists().notEmpty().isString(),
    authRequired({}),
    check('telegramUnlinkToken').exists().notEmpty().isString(),
    validateSchema,
  ]

  /**
   * @openapi
   * components:
   *   rules:
   *      verifyEmail:
   *          required:
   *             - verificationCode
   *          properties:
   *             verificationCode:
   *                type: string
   */
  const verifyEmailRules = [
    check('userId').exists().notEmpty().isString(),
    check('verificationCode').exists().notEmpty().isString(),
    validateSchema,
  ]

  const changeEmailRules = [
    authRequired({}),
    check('newEmail').exists().isEmail(),
    check('password').exists().notEmpty().isString(),
    validateSchema,
  ]

  const enableEncryptionRules = [
    authRequired({}),
    check('password').exists().notEmpty().isString(),
    validateSchema,
  ]

  /**
   * @openapi
   * components:
   *   rules:
   *      toggleReceiveEmails:
   *          required:
   *             - receiveEmails
   *          properties:
   *             receiveEmails:
   *                type: boolean
   */
  const toggleReceiveEmailsRules = [
    authRequired({}),
    check('receiveEmails').exists().notEmpty().isBoolean(),
    validateSchema,
  ]

  /**
   * @openapi
   * components:
   *   rules:
   *     changePassword:
   *       allOf:
   *         - $ref: '#/components/rules/authorization'
   *         - type: object
   *           properties:
   *             oldPassword:
   *               type: string
   *             newPassword:
   *               type: string
   */
  const changePasswordRules = [
    authRequired({}),
    check('oldPassword').exists().notEmpty().isString(),
    check('newPassword').exists().notEmpty().isString(),
    validateSchema,
  ]

  /**
   * @openapi
   * components:
   *   rules:
   *      updateYandexMetric:
   *          required: []
   *          properties:
   *             yandexMetricClientId:
   *                type: string
   *                nullable: true
   *             yandexMetricYclid:
   *                type: string
   *                nullable: true
   */
  const updateYandexMetricRules = [
    authRequired({}),
    check('yandexMetricClientId').optional({ nullable: true }).isString(),
    check('yandexMetricYclid').optional({ nullable: true }).isString(),
    validateSchema,
  ]

  return {
    getOAuthConsentURLRules,
    oauthAuthorizationRules,
    telegramAuthorizationRules,
    getMeRules,
    refreshRules,
    authorizationRules,
    sendResetLinkRules,
    resetPasswordRules,
    generateTelegramConnectionTokenRules,
    connectTelegramRules,
    fingerprintAuthorizationRules,
    verifyEmailRules,
    changeEmailRules,
    enableEncryptionRules,
    generateTelegramUnlinkTokenRules,
    unlinkTelegramRules,
    toggleReceiveEmailsRules,
    changePasswordRules,
    updateYandexMetricRules,
    logoutRules,
    logoutAllRules,
  }
}
