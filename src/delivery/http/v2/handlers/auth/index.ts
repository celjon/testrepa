import { buildGetMe, GetMe } from './me'
import { buildTelegramAuthorize, TelegramAuthorize } from './telegram'
import { buildRefresh, Refresh } from './refresh'
import { buildAuthorize, Authorize } from './authorize'
import { buildRegister, Register } from './register'
import { buildSendResetLink, SendResetLink } from './send-reset-link'
import { buildResetPassword, ResetPassword } from './reset-password'
import {
  buildGenerateTelegramConnectionToken,
  GenerateTelegramConnectionToken,
} from './generate-telegram-connection-token'
import {
  buildGenerateTelegramConnectionTokenPython,
  GenerateTelegramConnectionTokenPython,
} from './generate-telegram-connection-token-python'
import { buildConnectTelegram, ConnectTelegram } from './connect-telegram'
import { buildConnectTelegramPython, ConnectTelegramPython } from './connect-telegram-python'
import {
  buildGenerateTelegramUnlinkToken,
  GenerateTelegramUnlinkToken,
} from './generate-telegram-unlink-token'
import { buildUnlinkTelegram, UnlinkTelegram } from './unlink-telegram'

import Express from 'express'
import { IHandler } from '../types'
import { createRouteHandler } from '../../routeHandler'
import { buildAuthRules } from './rules'
import { DeliveryParams } from '@/delivery/types'
import { buildFingerprintAuthorize, FingerprintAuthorize } from './fingerprint'
import { buildVerifyEmailHandler, VerifyEmailHandler } from './verify-email'
import { buildOAuthAuthorize, OAuthAuthorize } from './oauth-authorize'
import { buildGetOAuthConsentURL, GetOAuthConsentURL } from './get-oauth-consent-url'
import { Middlewares } from '../../middlewares'
import { buildChangeEmail, ChangeEmail } from './change-email'
import { buildEnableEncryption, EnableEncryption } from './enable-encryption'
import { buildToggleReceiveEmails, ToggleReceiveEmails } from './toggle-receive-emails'
import { buildChangePassword, ChangePassword } from './change-password'
import { buildUpdateYandexMetric, UpdateYandexMetric } from './update-yandex-metric'
import { buildLogout, Logout } from './logout'
import { buildLogoutAll, LogoutAll } from './logout-all'

type Params = Pick<DeliveryParams, 'auth' | 'middlewares'>

export type AuthMethods = {
  getOAuthConsentURL: GetOAuthConsentURL
  oauthAuthorize: OAuthAuthorize
  telegram: TelegramAuthorize
  getMe: GetMe
  refresh: Refresh
  authorize: Authorize
  register: Register
  sendResetLink: SendResetLink
  resetPassword: ResetPassword
  generateTelegramConnectionToken: GenerateTelegramConnectionToken
  generateTelegramConnectionTokenPython: GenerateTelegramConnectionTokenPython
  connectTelegram: ConnectTelegram
  connectTelegramPython: ConnectTelegramPython
  fingerprint: FingerprintAuthorize
  verifyEmail: VerifyEmailHandler
  changeEmail: ChangeEmail
  enableEncryption: EnableEncryption
  generateTelegramUnlinkToken: GenerateTelegramUnlinkToken
  unlinkTelegram: UnlinkTelegram
  toggleReceiveEmails: ToggleReceiveEmails
  changePassword: ChangePassword
  updateYandexMetric: UpdateYandexMetric
  logout: Logout
  logoutAll: LogoutAll
}

const buildRegisterRoutes = (methods: AuthMethods, middlewares: Middlewares) => {
  const {
    authorizationRules,
    getOAuthConsentURLRules,
    connectTelegramRules,
    fingerprintAuthorizationRules,
    generateTelegramConnectionTokenRules,
    getMeRules,
    oauthAuthorizationRules,
    refreshRules,
    resetPasswordRules,
    sendResetLinkRules,
    telegramAuthorizationRules,
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
  } = buildAuthRules(middlewares)

  return (root: Express.Router) => {
    const namespace = Express.Router()

    /**
     * @openapi
     * /auth/oauth/consent-url:
     *   get:
     *     tags: [Auth]
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: provider
     *         in: query
     *         required: true
     *         type: string
     *       - name: redirect_uri
     *         in: query
     *         required: true
     *         type: string
     *     responses:
     *        200:
     *           description: Consent URL.
     *           content:
     *              application/json:
     *                schema:
     *                  properties:
     *                    consentURL:
     *                      type: string
     *                    code_verifier:
     *                      type: string
     */
    namespace.get(
      '/oauth/consent-url',
      getOAuthConsentURLRules,
      createRouteHandler(methods.getOAuthConsentURL),
    )

    /**
     * @openapi
     * /auth/oauth:
     *   post:
     *     tags: [Auth]
     *     produces:
     *       - application/json
     *     requestBody:
     *       in: body
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/rules/oauthAuthorize'
     *     responses:
     *        200:
     *           description: Authorized user.
     *           content:
     *              application/json:
     *                schema:
     *                  properties:
     *                    user:
     *                      $ref: '#/components/entities/User'
     *                    accessToken:
     *                      type: string
     *                    refreshToken:
     *                      type: string
     */
    namespace.post('/oauth', oauthAuthorizationRules, createRouteHandler(methods.oauthAuthorize))

    /**
     * @openapi
     * /auth/signin:
     *   post:
     *     tags: [Auth]
     *     produces:
     *       - application/json
     *     requestBody:
     *       in: body
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/rules/authorization'
     *     responses:
     *        200:
     *           description: Authorized user.
     *           content:
     *              application/json:
     *                schema:
     *                  properties:
     *                    user:
     *                      $ref: '#/components/entities/User'
     *                    accessToken:
     *                      type: string
     *                    refreshToken:
     *                      type: string
     */
    namespace.post('/signin', authorizationRules, createRouteHandler(methods.authorize))

    /**
     * @openapi
     * /auth/signup:
     *   post:
     *     tags: [Auth]
     *     produces:
     *       - application/json
     *     requestBody:
     *       in: body
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/rules/authorization'
     *     responses:
     *        200:
     *           description: Created user.
     *           content:
     *              application/json:
     *                schema:
     *                  properties:
     *                    user:
     *                      $ref: '#/components/entities/User'
     */
    namespace.post('/signup', authorizationRules, createRouteHandler(methods.register))

    /**
     * @openapi
     * /auth/refresh:
     *   post:
     *     tags: [Auth]
     *     produces:
     *       - application/json
     *     requestBody:
     *       in: body
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/rules/refreshToken'
     *     responses:
     *        200:
     *           description: Authorized user.
     *           content:
     *              application/json:
     *                schema:
     *                  properties:
     *                    accessToken:
     *                      type: string
     *                    refreshToken:
     *                      type: string
     */
    namespace.post('/refresh', refreshRules, createRouteHandler(methods.refresh))

    /**
     * @openapi
     * /auth/telegram:
     *   post:
     *     tags: [Auth]
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: botsecretkey
     *         in: header
     *         required: true
     *         type: string
     *     requestBody:
     *       in: body
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/rules/telegramAuthorize'
     *     responses:
     *        200:
     *           description: Authorized user.
     *           content:
     *              application/json:
     *                schema:
     *                  properties:
     *                    user:
     *                      $ref: '#/components/entities/User'
     *                    accessToken:
     *                      type: string
     */
    namespace.post('/telegram', telegramAuthorizationRules, createRouteHandler(methods.telegram))

    /**
     * @openapi
     * /auth/request-reset-password:
     *   post:
     *     tags: [Auth]
     *     produces:
     *       - application/json
     *     requestBody:
     *       in: body
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *            $ref: '#/components/rules/sendResetLink'
     *     responses:
     *        200:
     *           description: Email sent.
     */
    namespace.post(
      '/request-reset-password',
      sendResetLinkRules,
      createRouteHandler(methods.sendResetLink),
    )

    /**
     * @openapi
     * /auth/reset-password:
     *   post:
     *     tags: [Auth]
     *     produces:
     *       - application/json
     *     requestBody:
     *       in: body
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *            $ref: '#/components/rules/resetPassword'
     *     responses:
     *        200:
     *           description: Password reset.
     */
    namespace.post('/reset-password', resetPasswordRules, createRouteHandler(methods.resetPassword))

    /**
     * @openapi
     * /auth/telegram-connection-token:
     *   get:
     *     tags: [Auth]
     *     security:
     *      - bearerAuth: []
     *     produces:
     *       - application/json
     *     responses:
     *        200:
     *           content:
     *              application/json:
     *                schema:
     *                  properties:
     *                    telegramConnectionToken:
     *                      type: string
     */
    namespace.get(
      '/telegram-connection-token',
      generateTelegramConnectionTokenRules,
      createRouteHandler(methods.generateTelegramConnectionToken),
    )

    /**
     * @openapi
     * /auth/telegram-connection-token-python:
     *   get:
     *     tags: [Auth]
     *     security:
     *      - bearerAuth: []
     *     produces:
     *       - application/json
     *     responses:
     *        200:
     *           content:
     *              application/json:
     *                schema:
     *                  properties:
     *                    telegramConnectionToken:
     *                      type: string
     */
    namespace.get(
      '/telegram-connection-token-python',
      generateTelegramConnectionTokenRules,
      createRouteHandler(methods.generateTelegramConnectionTokenPython),
    )

    /**
     * @openapi
     * /auth/connect-telegram:
     *   post:
     *     tags: [Auth]
     *     security:
     *      - bearerAuth: []
     *     produces:
     *       - application/json
     *     requestBody:
     *       in: body
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *            $ref: '#/components/rules/connectTelegram'
     *     responses:
     *        200:
     *           content:
     *              application/json:
     *                schema:
     *                      $ref: '#/components/entities/User'
     */
    namespace.post(
      '/connect-telegram',
      connectTelegramRules,
      createRouteHandler(methods.connectTelegram),
    )

    /**
     * @openapi
     * /auth/connect-telegram-python:
     *   post:
     *     tags: [Auth]
     *     security:
     *      - bearerAuth: []
     *     produces:
     *       - application/json
     *     requestBody:
     *       in: body
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *            $ref: '#/components/rules/connectTelegram'
     *     responses:
     *        200:
     *           content:
     *              application/json:
     *                schema:
     *                      $ref: '#/components/entities/User'
     */
    namespace.post(
      '/connect-telegram-python',
      connectTelegramRules,
      createRouteHandler(methods.connectTelegramPython),
    )

    /**
     * @openapi
     * /auth/telegram-unlink-token:
     *   get:
     *     tags: [Auth]
     *     security:
     *      - bearerAuth: []
     *     produces:
     *       - application/json
     *     responses:
     *        200:
     *           content:
     *              application/json:
     *                schema:
     *                  properties:
     *                    telegramUnlinkToken:
     *                      type: string
     */
    namespace.get(
      '/telegram-unlink-token',
      generateTelegramUnlinkTokenRules,
      createRouteHandler(methods.generateTelegramUnlinkToken),
    )

    /**
     * @openapi
     * /auth/unlink-telegram:
     *   post:
     *     tags: [Auth]
     *     security:
     *      - bearerAuth: []
     *     produces:
     *       - application/json
     *     requestBody:
     *       in: body
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *            $ref: '#/components/rules/unlinkTelegram'
     *     responses:
     *        200:
     *           content:
     *              application/json:
     *                schema:
     *                      $ref: '#/components/entities/User'
     */
    namespace.post(
      '/unlink-telegram',
      unlinkTelegramRules,
      createRouteHandler(methods.unlinkTelegram),
    )

    namespace.post(
      '/fingerprint',
      fingerprintAuthorizationRules,
      createRouteHandler(methods.fingerprint),
    )

    /**
     * @openapi
     * /auth/verify-email:
     *   post:
     *     tags: [Auth]
     *     security:
     *      - bearerAuth: []
     *     produces:
     *       - application/json
     *     requestBody:
     *       in: body
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *            $ref: '#/components/rules/verifyEmail'
     *     responses:
     *        200:
     *           description: Email verified.
     */
    namespace.post('/verify-email', verifyEmailRules, createRouteHandler(methods.verifyEmail))

    namespace.patch('/email', changeEmailRules, createRouteHandler(methods.changeEmail))

    /**
     * @openapi
     * /auth/receive-emails:
     *   post:
     *     tags: [Auth]
     *     security:
     *      - bearerAuth: []
     *     produces:
     *       - application/json
     *     requestBody:
     *       in: body
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *            $ref: '#/components/rules/toggleReceiveEmails'
     *     responses:
     *        200:
     *           description: Updated subscription.
     *           content:
     *              application/json:
     *                 schema:
     *                    $ref: '#/components/entities/Subscription'
     */
    namespace.post(
      '/receive-emails',
      toggleReceiveEmailsRules,
      createRouteHandler(methods.toggleReceiveEmails),
    )

    /**
     * @openapi
     * /auth/me:
     *   get:
     *     tags: [Auth]
     *     security:
     *      - bearerAuth: []
     *     produces:
     *       - application/json
     *     responses:
     *        200:
     *           content:
     *              application/json:
     *                schema:
     *                      $ref: '#/components/entities/User'
     */
    namespace.get('/me', getMeRules, createRouteHandler(methods.getMe))

    /**
     * @swagger
     * /auth/enable-encryption:
     *   post:
     *     summary: Enable encryption for user
     *     tags: [Auth]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               password:
     *                 type: string
     *     responses:
     *        200:
     *           description: New access token and refresh token
     *           content:
     *              application/json:
     *                schema:
     *                  properties:
     *                    accessToken:
     *                      type: string
     *                    refreshToken:
     *                      type: string
     */
    namespace.post(
      '/encryption/enable',
      enableEncryptionRules,
      createRouteHandler(methods.enableEncryption),
    )

    /**
     * @swagger
     * /auth/change-password:
     *   post:
     *     summary: Change password
     *     tags: [Auth]
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               oldPassword:
     *                 type: string
     *               newPassword:
     *                 type: string
     *     responses:
     *        200:
     *           description: New access token and refresh token
     *           content:
     *              application/json:
     *                schema:
     *                  properties:
     *                    accessToken:
     *                      type: string
     *                    refreshToken:
     *                      type: string
     */
    namespace.post(
      '/change-password',
      changePasswordRules,
      createRouteHandler(methods.changePassword),
    )

    /**
     * @openapi
     * /auth/update-yandex-metric:
     *   patch:
     *     tags: [Auth]
     *     security:
     *      - bearerAuth: []
     *     produces:
     *       - application/json
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               yandexMetricClientId:
     *                 type: string
     *                 nullable: true
     *               yandexMetricYclid:
     *                 type: string
     *                 nullable: true
     *     responses:
     *        200:
     *           content:
     *              application/json:
     *                schema:
     *                    $ref: '#/components/entities/User'
     */
    namespace.patch(
      '/update-yandex-metric',
      updateYandexMetricRules,
      createRouteHandler(methods.updateYandexMetric),
    )

    /**
     * @openapi
     * /auth/logout:
     *   post:
     *     tags: [Auth]
     *     security:
     *      - bearerAuth: []
     *     produces:
     *       - application/json
     *     requestBody:
     *       in: body
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/rules/refreshToken'
     *     responses:
     *        200:
     *           description: Authorized user.
     *           content:
     *              application/json:
     *                schema:
     *                  properties:
     *                    message:
     *                      type: string
     */
    namespace.post('/logout', logoutRules, createRouteHandler(methods.logout))
    /**
     * @openapi
     * /auth/logout-all:
     *   get:
     *     tags: [Auth]
     *     security:
     *      - bearerAuth: []
     *     produces:
     *       - application/json
     *     responses:
     *        200:
     *           content:
     *              application/json:
     *                schema:
     *                  properties:
     *                    message:
     *                      type: string
     */
    namespace.get('/logout-all', logoutAllRules, createRouteHandler(methods.logoutAll))

    root.use('/auth', namespace)
  }
}

export const buildAuthHandler = (params: Params): IHandler => {
  const getOAuthConsentURL = buildGetOAuthConsentURL(params)
  const oauthAuthorize = buildOAuthAuthorize(params)
  const telegram = buildTelegramAuthorize(params)
  const getMe = buildGetMe(params)
  const refresh = buildRefresh(params)
  const authorize = buildAuthorize(params)
  const register = buildRegister(params)
  const sendResetLink = buildSendResetLink(params)
  const resetPassword = buildResetPassword(params)
  const generateTelegramConnectionToken = buildGenerateTelegramConnectionToken(params)
  const generateTelegramConnectionTokenPython = buildGenerateTelegramConnectionTokenPython(params)
  const connectTelegram = buildConnectTelegram(params)
  const connectTelegramPython = buildConnectTelegramPython(params)
  const verifyEmail = buildVerifyEmailHandler(params)
  const changeEmail = buildChangeEmail(params)
  const enableEncryption = buildEnableEncryption(params)
  const generateTelegramUnlinkToken = buildGenerateTelegramUnlinkToken(params)
  const unlinkTelegram = buildUnlinkTelegram(params)
  const toggleReceiveEmails = buildToggleReceiveEmails(params)
  const changePassword = buildChangePassword(params)
  const updateYandexMetric = buildUpdateYandexMetric(params)
  const logout = buildLogout(params)
  const logoutAll = buildLogoutAll(params)

  return {
    registerRoutes: buildRegisterRoutes(
      {
        getOAuthConsentURL,
        oauthAuthorize,
        telegram,
        getMe,
        refresh,
        authorize,
        register,
        sendResetLink,
        resetPassword,
        generateTelegramConnectionToken,
        generateTelegramConnectionTokenPython,
        connectTelegram,
        connectTelegramPython,
        fingerprint: buildFingerprintAuthorize(params),
        verifyEmail,
        changeEmail,
        enableEncryption,
        generateTelegramUnlinkToken,
        unlinkTelegram,
        toggleReceiveEmails,
        changePassword,
        updateYandexMetric,
        logout,
        logoutAll,
      },
      params.middlewares,
    ),
  }
}
