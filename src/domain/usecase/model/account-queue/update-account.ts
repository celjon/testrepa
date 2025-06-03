import { config } from '@/config'
import { IModelAccount } from '@/domain/entity/modelAccount'
import { UseCaseParams } from '@/domain/usecase/types'
import { FileType, ModelAccountAuthType, ModelAccountStatus } from '@prisma/client'

type File = {
  size: number
  path: string
  originalname: string
  buffer: Buffer
}

export type UpdateAccount = (params: {
  id: string
  name?: string
  authType?: ModelAccountAuthType
  g4fApiUrl?: string
  g4fAuth?: string
  g4fHarFile?: File
  g4fEmail?: string
  g4fPassword?: string
  g4fEmailPassword?: string
  g4fIMAPServer?: string
  mjChannelId?: string
  mjServerId?: string
  mjToken?: string
  mjConcurrency?: number
  mjPersonalizationKey?: string
  queueId?: string
  disabledAt?: Date | null
  inactive?: boolean
  status?: ModelAccountStatus
}) => Promise<IModelAccount | null | never>

export const buildUpdateAccount =
  ({ adapter }: UseCaseParams): UpdateAccount =>
  async ({
    id,
    name,
    authType,
    g4fApiUrl,
    g4fAuth,
    g4fHarFile,
    g4fEmail,
    g4fPassword,
    g4fEmailPassword,
    g4fIMAPServer,
    mjChannelId,
    mjServerId,
    mjToken,
    mjConcurrency,
    queueId,
    disabledAt,
    status,
    mjPersonalizationKey
  }) => {
    let modelAccount = await adapter.modelAccountRepository.get({ where: { id } })

    if (modelAccount?.mj_channel_id) {
      await adapter.modelAccountRepository.update({
        where: {
          id
        },
        data: {
          status: status ?? ModelAccountStatus.INACTIVE,
          mj_active_generations: 0
        }
      })
    }

    let g4f_password: string | undefined = undefined
    let g4f_email_password: string | undefined = undefined

    const dek = await adapter.cryptoGateway.getKeyFromString(config.model_providers.g4f.encryption_key)

    if (g4fPassword !== undefined) {
      g4f_password = await adapter.cryptoGateway.encrypt({
        dek,
        data: g4fPassword
      })
    }
    if (g4fEmailPassword !== undefined) {
      g4f_email_password = await adapter.cryptoGateway.encrypt({
        dek: dek,
        data: g4fEmailPassword
      })
    }
    let harFileUpdatedAt = undefined
    const apiURL = modelAccount?.g4f_api_url ?? g4fApiUrl
    if (g4fHarFile && apiURL) {
      const harManagerUrl = config.model_providers.g4f.har_manager_url

      await adapter.g4fGateway.writeHarFile({
        name: g4fHarFile.originalname,
        buffer: g4fHarFile.buffer,
        apiUrl: apiURL,
        harManagerUrl
      })
      harFileUpdatedAt = new Date()
    }

    modelAccount = await adapter.modelAccountRepository.update({
      where: { id },
      data: {
        name,
        auth_type: authType,
        g4f_api_url: g4fApiUrl,
        g4f_auth: g4fAuth,
        ...(g4fHarFile && {
          g4f_har_file: {
            create: {
              type: FileType.HAR,
              name: g4fHarFile.originalname
            }
          }
        }),
        g4f_har_file_updated_at: harFileUpdatedAt,
        g4f_email: g4fEmail,
        ...(g4f_password !== undefined && {
          g4f_password
        }),
        ...(g4f_email_password !== undefined && {
          g4f_email_password
        }),
        g4f_imap_server: g4fIMAPServer,
        mj_channel_id: mjChannelId,
        mj_server_id: mjServerId,
        mj_token: mjToken,
        mj_personalization_key: mjPersonalizationKey,
        mj_concurrency: mjConcurrency,
        ...(queueId && {
          queue: {
            connect: {
              id: queueId
            }
          }
        }),
        disabled_at: disabledAt
      },
      include: {
        g4f_har_file: true
      }
    })

    modelAccount.g4f_password = g4fPassword ? g4fPassword : null
    modelAccount.g4f_email_password = g4fEmailPassword ? g4fEmailPassword : null

    return modelAccount
  }
