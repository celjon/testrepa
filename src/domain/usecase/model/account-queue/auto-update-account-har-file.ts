import { Observable, share } from 'rxjs'
import { ModelAccountAuthType, ModelAccountStatus } from '@prisma/client'
import { config } from '@/config'
import { logger } from '@/lib/logger'
import { getErrorString } from '@/lib'
import { ForbiddenError, InvalidDataError, NotFoundError } from '@/domain/errors'
import { UseCaseParams } from '@/domain/usecase/types'

export type AutoUpdateAccountHARFile = (params: { accountId: string }) => Promise<{
  stream: Observable<string>
  close: () => void
}>

export const buildAutoUpdateAccountHARFile =
  ({ adapter, service }: UseCaseParams): AutoUpdateAccountHARFile =>
  async ({ accountId }) => {
    let account = await adapter.modelAccountRepository.get({
      where: { id: accountId },
    })

    if (!account) {
      throw new NotFoundError({
        code: 'MODEL_ACCOUNT_NOT_FOUND',
      })
    }
    account = await service.model.accountBalancer.decryptAccount({ account })

    if (account.disabled_at) {
      throw new ForbiddenError({
        code: 'MODEL_ACCOUNT_DISABLED',
      })
    }

    if (
      account.auth_type !== ModelAccountAuthType.HAR_FILE ||
      !account.g4f_email ||
      !account.g4f_password ||
      !account.g4f_api_url ||
      !account.name
    ) {
      throw new InvalidDataError({
        code: 'MODEL_ACCOUNT_AUTO_UPDATE_HAR_NOT_SUPPORTED',
      })
    }

    const response = await adapter.g4fGateway.autoUpdateHARFiles({
      harManagerUrl: config.model_providers.g4f.har_manager_url,
      accounts: [
        {
          harFileName: account.name.replaceAll(' ', '-') + '.har',
          email: account.g4f_email,
          password: account.g4f_password,
          emailPassword: account.g4f_email_password ?? '',
          imapServer: account.g4f_imap_server ?? '',
          apiUrl: account.g4f_api_url,
        },
      ],
    })

    const newStream = response.stream.pipe(share())

    newStream.subscribe((event) => {
      async function checkEvent() {
        try {
          const eventData = JSON.parse(event.replace('data: ', ''))
          if (
            account &&
            eventData.type === 'HAR_FILE_UPDATED' &&
            eventData.email === account.g4f_email
          ) {
            await adapter.modelAccountRepository.update({
              where: { id: accountId },
              data: {
                g4f_har_file_updated_at: new Date(),
                status:
                  account.status === ModelAccountStatus.INACTIVE
                    ? ModelAccountStatus.ACTIVE
                    : undefined,
              },
            })
          }
        } catch (e) {
          logger.error({
            location: 'autoUpdateAccountHARFile',
            message: getErrorString(e),
          })
        }
      }
      checkEvent()
    })

    return { ...response, stream: newStream }
  }
