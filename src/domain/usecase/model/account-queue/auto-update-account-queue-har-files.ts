import { Observable, share } from 'rxjs'
import { ModelAccountAuthType } from '@prisma/client'
import { config } from '@/config'
import { getErrorString } from '@/lib'
import { logger } from '@/lib/logger'
import { NotFoundError } from '@/domain/errors'
import { UseCaseParams } from '@/domain/usecase/types'

export type AutoUpdateAccountQueueHARFiles = (params: { accountQueueId: string }) => Promise<{
  stream: Observable<string>
  close: () => void
}>

export const buildAutoUpdateAccountQueueHARFiles =
  ({ adapter, service }: UseCaseParams): AutoUpdateAccountQueueHARFiles =>
  async ({ accountQueueId }) => {
    let accounts = await adapter.modelAccountRepository.list({
      where: { queue_id: accountQueueId }
    })

    accounts = await Promise.all(
      accounts.map((account) => {
        return service.model.accountBalancer.decryptAccount({ account })
      })
    )

    const mappedAccounts = []
    for (const account of accounts) {
      if (
        account.auth_type !== ModelAccountAuthType.HAR_FILE ||
        !account.g4f_email ||
        !account.g4f_password ||
        !account.g4f_api_url ||
        !account.name
      ) {
        continue
      }

      mappedAccounts.push({
        harFileName: account.name.replaceAll(' ', '-') + '.har',
        email: account.g4f_email,
        password: account.g4f_password,
        emailPassword: account.g4f_email_password ?? '',
        imapServer: account.g4f_imap_server ?? '',
        apiUrl: account.g4f_api_url
      })
    }

    if (!mappedAccounts.length) {
      throw new NotFoundError({
        code: 'MODEL_ACCOUNTS_NOT_FOUND'
      })
    }

    const response = await adapter.g4fGateway.autoUpdateHARFiles({
      harManagerUrl: config.model_providers.g4f.har_manager_url,
      accounts: mappedAccounts
    })

    const newStream = response.stream.pipe(share())

    newStream.subscribe((event) => {
      async function checkEvent() {
        try {
          const eventData = JSON.parse(event.replace('data: ', ''))
          if (eventData.type === 'HAR_FILE_UPDATED') {
            const account = accounts.find((acc) => acc.g4f_email && acc.g4f_email === eventData.email)

            if (account) {
              await adapter.modelAccountRepository.update({
                where: { id: account.id },
                data: {
                  g4f_har_file_updated_at: new Date(),
                  disabled_at: null
                }
              })
            }
          }
        } catch (e) {
          logger.error({
            location: 'autoUpdateAccountQueueHARFiles',
            message: getErrorString(e)
          })
        }
      }
      checkEvent()
    })

    return { ...response, stream: newStream }
  }
