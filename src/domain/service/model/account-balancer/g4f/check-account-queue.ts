import {
  MessageStatus,
  ModelAccountAuthType,
  ModelAccountModelStatus,
  ModelAccountStatus,
} from '@prisma/client'
import { getErrorString, getRandomInt } from '@/lib'
import { logger } from '@/lib/logger'
import { Adapter } from '@/domain/types'
import { IModelAccount } from '@/domain/entity/model-account'
import { IModelAccountModel } from '@/domain/entity/model-account-model'

type Params = Pick<Adapter, 'g4fGateway' | 'modelAccountRepository' | 'modelAccountModelRepository'>

export type CheckAccountQueue = (params: { accountQueueId: string }) => Promise<IModelAccount[]>

export const buildCheckAccountQueue = ({
  g4fGateway,
  modelAccountRepository,
  modelAccountModelRepository,
}: Params): CheckAccountQueue => {
  return async ({ accountQueueId }) => {
    const g4fAccounts = await modelAccountRepository.list({
      where: {
        queue_id: accountQueueId,
        g4f_har_file_id: {
          not: null,
        },
        g4f_api_url: {
          not: null,
        },
        auth_type: ModelAccountAuthType.HAR_FILE,
      },
      include: {
        models: {
          include: {
            model: {
              include: {
                child_provider: true,
              },
            },
          },
        },
      },
    })

    const getAccountModelStatus = async (
      g4fAccount: IModelAccount,
      g4fAccountModel: IModelAccountModel,
    ): Promise<{
      disabled_at?: Date
      status: ModelAccountModelStatus
    }> => {
      try {
        if (
          !g4fAccount.g4f_api_url ||
          !g4fAccountModel.model ||
          !g4fAccountModel.model?.provider_id
        ) {
          return { disabled_at: new Date(), status: ModelAccountModelStatus.INACTIVE }
        }

        await g4fGateway.sync({
          settings: {
            model: g4fAccountModel.model.id,
            system_prompt:
              'You are an assistant that welcomes users with a friendly greeting and provides accurate information about the current date and day of the week. Always begin your responses by greeting the user and stating the current date in a clear format. Your tone should be warm and helpful. After providing the date information, offer to assist the user with whatever they might need today.',
          },
          messages: [
            {
              role: 'user',
              content: greetings[getRandomInt(0, greetings.length - 1)],
              action_type: null,
              additional_content: null,
              chat_id: '',
              choiced: true,
              created_at: new Date(),
              disabled: false,
              full_content: null,
              id: '',
              isEncrypted: false,
              job_id: null,
              mj_mode: null,
              model_id: null,
              model_version: null,
              next_version_id: null,
              platform: null,
              previous_version_id: null,
              reasoning_content: null,
              reasoning_time_ms: null,
              request_id: null,
              search_status: null,
              set_id: null,
              status: MessageStatus.DONE,
              tokens: 0,
              transaction_id: null,
              user_id: '',
              version: 0,
              video_id: null,
              voice_id: null,
            },
          ],
          apiUrl: g4fAccount.g4f_api_url,
          provider: g4fAccountModel.model.child_provider?.name ?? undefined,
          endUserId: '',
        })
        return { status: ModelAccountModelStatus.ACTIVE }
      } catch (error) {
        logger.error({
          location: 'checkG4FAccountQueue',
          message: getErrorString(error),
        })

        return { status: ModelAccountModelStatus.INACTIVE }
      }
    }

    await Promise.all(
      g4fAccounts.map(async (g4fAccount) => {
        if (
          g4fAccount.disabled_at ||
          g4fAccount.status === ModelAccountStatus.OFFLINE ||
          !g4fAccount.g4f_api_url ||
          !g4fAccount.models
        ) {
          return
        }

        let allModelsDisabled = true
        await Promise.all(
          g4fAccount.models.map(async (g4fAccountModel) => {
            if (g4fAccountModel.disabled_at) {
              return
            }

            const start = performance.now()
            const { disabled_at, status } = await getAccountModelStatus(g4fAccount, g4fAccountModel)
            const generationTimeMs = performance.now() - start

            if (!disabled_at || status === ModelAccountModelStatus.ACTIVE) {
              allModelsDisabled = false
            }
            const usageTimeMs = g4fAccountModel.usage_time.getTime()

            await modelAccountModelRepository.update({
              where: { id: g4fAccountModel.id },
              data: {
                disabled_at,
                status,
                usage_count: { increment: 1 },
                usage_time: new Date(usageTimeMs + generationTimeMs),
                status_reason: null,
              },
            })
          }),
        )

        if (allModelsDisabled && g4fAccount.status !== ModelAccountStatus.INACTIVE) {
          await modelAccountRepository.update({
            where: {
              id: g4fAccount.id,
            },
            data: {
              status: ModelAccountStatus.INACTIVE,
            },
          })
        }

        if (!allModelsDisabled && g4fAccount.status !== ModelAccountStatus.ACTIVE) {
          await modelAccountRepository.update({
            where: {
              id: g4fAccount.id,
            },
            data: {
              status: ModelAccountStatus.ACTIVE,
            },
          })
        }
      }),
    )

    const updatedG4FAccounts = await modelAccountRepository.list({
      where: {
        queue_id: accountQueueId,
      },
      orderBy: {
        created_at: 'desc',
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

    return updatedG4FAccounts.map((account) => {
      account.g4f_password = null
      account.g4f_email_password = null

      return account
    })
  }
}

const greetings = [
  'Hey',
  'hey',
  'Hello',
  'hello',
  'Hi',
  'hi',
  'Whats up?',
  'whats up?',
  "How it's going?",
  "how it's going?",
  'whats going on?',
]
