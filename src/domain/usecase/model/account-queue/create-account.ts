import { IModelAccount } from '@/domain/entity/modelAccount'
import { ForbiddenError } from '@/domain/errors'
import { UseCaseParams } from '@/domain/usecase/types'
import { FileType, ModelAccountAuthType } from '@prisma/client'
import { config as cfg, config } from '@/config'

type File = {
  size: number
  path: string
  originalname: string
  buffer: Buffer
}

export type CreateAccount = (params: {
  name: string
  authType: ModelAccountAuthType
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
  mjPersonalizationKey?: string
  mjConcurrency?: number
  queueId?: string
  disabledAt?: Date | null
}) => Promise<IModelAccount | null | never>

export const buildCreateAccount =
  ({ adapter }: UseCaseParams): CreateAccount =>
  async ({
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
    mjPersonalizationKey
  }) => {
    let modelAccount
    const harManagerUrl = cfg.model_providers.g4f.har_manager_url

    if (mjChannelId && mjServerId && mjToken) {
      modelAccount = await adapter.modelAccountRepository.create({
        data: {
          name,
          auth_type: authType,
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
        }
      })

      await adapter.midjourneyGateway.account.add({
        id: modelAccount.id,
        SalaiToken: mjToken,
        ServerId: mjServerId,
        ChannelId: mjChannelId
      })
    } else if (authType && (g4fAuth || g4fApiUrl)) {
      let g4f_password: string | null = null
      let g4f_email_password: string | null = null

      const dek = await adapter.cryptoGateway.getKeyFromString(config.model_providers.g4f.encryption_key)

      if (g4fPassword) {
        g4f_password = await adapter.cryptoGateway.encrypt({
          dek,
          data: g4fPassword
        })
      }
      if (g4fEmailPassword) {
        g4f_email_password = await adapter.cryptoGateway.encrypt({
          dek: dek,
          data: g4fEmailPassword
        })
      }
      let harFileUpdatedAt = null
      if (g4fHarFile && g4fApiUrl) {
        await adapter.g4fGateway.writeHarFile({
          name: g4fHarFile.originalname,
          buffer: g4fHarFile.buffer,
          apiUrl: g4fApiUrl,
          harManagerUrl: harManagerUrl
        })
        harFileUpdatedAt = new Date()
      }

      modelAccount = await adapter.modelAccountRepository.create({
        data: {
          name,
          auth_type: authType,
          g4f_auth: g4fAuth,
          g4f_api_url: g4fApiUrl,
          ...(g4fHarFile && {
            g4f_har_file: {
              create: {
                type: FileType.HAR,
                name: g4fHarFile.originalname,
                path: g4fHarFile.path
              }
            }
          }),
          g4f_har_file_updated_at: harFileUpdatedAt,
          g4f_email: g4fEmail,
          g4f_password,
          g4f_email_password,
          g4f_imap_server: g4fIMAPServer,
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
    } else {
      throw new ForbiddenError({ code: 'UNKNOWN_ACCOUNT_PROVIDER' })
    }

    modelAccount.g4f_password = g4fPassword ? g4fPassword : null
    modelAccount.g4f_email_password = g4fEmailPassword ? g4fEmailPassword : null

    return modelAccount
  }
