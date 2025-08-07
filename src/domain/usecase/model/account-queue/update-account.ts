import { FileType, ModelAccountAuthType, ModelAccountStatus } from '@prisma/client'
import { config } from '@/config'
import { g4fIsPhaseChanged, IModelAccount } from '@/domain/entity/model-account'
import { UseCaseParams } from '@/domain/usecase/types'

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
  g4fOnlinePhaseSeconds?: number | null
  g4fOfflinePhaseSeconds?: number | null
  mjChannelId?: string
  mjServerId?: string
  mjToken?: string
  mjConcurrency?: number
  mjPersonalizationKey?: string
  queueId?: string
  disabledAt?: Date | null
  status?: ModelAccountStatus
  usageCountLimit?: number
  usageResetIntervalSeconds?: number | null
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
    g4fOnlinePhaseSeconds,
    g4fOfflinePhaseSeconds,
    mjChannelId,
    mjServerId,
    mjToken,
    mjConcurrency,
    mjPersonalizationKey,
    queueId,
    disabledAt,
    status,
    usageCountLimit,
    usageResetIntervalSeconds,
  }) => {
    let modelAccount = await adapter.modelAccountRepository.get({ where: { id } })

    if (modelAccount?.mj_channel_id) {
      await adapter.modelAccountRepository.update({
        where: {
          id,
        },
        data: {
          status: status ?? ModelAccountStatus.INACTIVE,
          mj_active_generations: 0,
        },
      })
    }

    let g4f_password: string | undefined = undefined
    let g4f_email_password: string | undefined = undefined

    const dek = await adapter.cryptoGateway.getKeyFromString(
      config.model_providers.g4f.encryption_key,
    )

    if (g4fPassword !== undefined) {
      g4f_password = await adapter.cryptoGateway.encrypt({
        dek,
        data: g4fPassword,
      })
    }
    if (g4fEmailPassword !== undefined) {
      g4f_email_password = await adapter.cryptoGateway.encrypt({
        dek: dek,
        data: g4fEmailPassword,
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
        harManagerUrl,
      })
      harFileUpdatedAt = new Date()
    }

    const newStatus = modelAccount?.auth_type === ModelAccountAuthType.HAR_FILE ? status : undefined
    const g4fPhaseUpdatedAt =
      modelAccount && newStatus && g4fIsPhaseChanged(modelAccount.status, newStatus)
        ? new Date()
        : undefined

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
              name: g4fHarFile.originalname,
            },
          },
        }),
        g4f_har_file_updated_at: harFileUpdatedAt,
        g4f_email: g4fEmail,
        ...(g4f_password !== undefined && {
          g4f_password,
        }),
        ...(g4f_email_password !== undefined && {
          g4f_email_password,
        }),
        g4f_imap_server: g4fIMAPServer,
        g4f_online_phase_seconds: g4fOnlinePhaseSeconds,
        g4f_offline_phase_seconds: g4fOfflinePhaseSeconds,
        mj_channel_id: mjChannelId,
        mj_server_id: mjServerId,
        mj_token: mjToken,
        mj_personalization_key: mjPersonalizationKey,
        mj_concurrency: mjConcurrency,
        ...(queueId && {
          queue: {
            connect: {
              id: queueId,
            },
          },
        }),
        status: newStatus,
        g4f_phase_updated_at: g4fPhaseUpdatedAt,
        disabled_at: disabledAt,
        usage_count_limit: usageCountLimit,
        usage_reset_interval_seconds: usageResetIntervalSeconds,
      },
      include: {
        g4f_har_file: true,
        models: {
          orderBy: {
            created_at: 'desc',
          },
          include: {
            model: true,
          },
        },
      },
    })

    modelAccount.g4f_password = g4fPassword ? g4fPassword : null
    modelAccount.g4f_email_password = g4fEmailPassword ? g4fEmailPassword : null

    return modelAccount
  }
