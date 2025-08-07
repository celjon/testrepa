import {
  MessageStatus,
  ModelAccountAuthType,
  ModelAccountModelStatus,
  ModelAccountStatus,
} from '@prisma/client'
import { config, devMode } from '@/config'
import { TgBotParseMode } from '@/lib/clients/tg-bot'
import { getErrorString, getRandomInt } from '@/lib'
import { logger } from '@/lib/logger'
import { Adapter } from '@/domain/types'
import { IModelAccount } from '@/domain/entity/model-account'
import { IModelProvider } from '@/domain/entity/model-provider'
import { ModelAccountModelStatusReason } from '@/domain/entity/model-account-model'
import { BaseError } from '@/domain/errors'

type AccountModel = {
  id: string | null
  model?: {
    id: string
    child_provider?: {
      name: string | null
    } | null
    provider_id: string | null
  } | null
  disabled_at: null | Date
  status: ModelAccountModelStatus | null
  status_reason: string | null
}

type Params = Pick<
  Adapter,
  | 'g4fGateway'
  | 'modelAccountRepository'
  | 'modelAccountModelRepository'
  | 'queueManager'
  | 'tgNotificationBotGateway'
>

export type CheckModelSubstitutions = () => Promise<void>

export const buildCheckModelSubstitutions = ({
  g4fGateway,
  modelAccountRepository,
  modelAccountModelRepository,
  queueManager,
  tgNotificationBotGateway,
}: Params): CheckModelSubstitutions => {
  return async () => {
    try {
      let accounts = await modelAccountRepository.list({
        where: {
          queue: {
            provider: { parent_id: config.model_providers.g4f.id },
          },
          g4f_api_url: { not: null },
          disabled_at: null,
          status: ModelAccountStatus.ACTIVE,
          auth_type: ModelAccountAuthType.HAR_FILE,
        },
        include: {
          models: {
            include: {
              model: { include: { child_provider: true } },
            },
          },
        },
      })

      const getAccountModelStatus = async (
        g4fAccount: IModelAccount,
        g4fAccountModel: AccountModel,
      ): Promise<{
        status?: ModelAccountModelStatus
      }> => {
        try {
          if (!g4fAccount.g4f_api_url || !g4fAccountModel.model) {
            return {}
          }

          const prompt = prompts[getRandomInt(0, prompts.length - 1)]
          const response = await g4fGateway.sync({
            settings: {
              model: g4fAccountModel.model.id,
              system_prompt: `Enable reasoning. Think step-by-step and reason through every question thoroughly before responding. Remember: Even for seemingly straightforward questions, demonstrate your reasoning process.\nAlways start responses with your model name (e.g., gpt-4o, gpt-4.1, o4-mini etc.).\nResponse Format: <model-name>[your response]`,
            },
            messages: [
              {
                role: 'user',
                content: prompt,
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
            provider: g4fAccountModel.model.child_provider?.name ?? 'OpenaiAccount',
            endUserId: '',
          })

          if (
            !response.message.content.toLowerCase().includes('o4-mini') &&
            !response.message.content.toLowerCase().includes('o4 mini') &&
            (response.message.content.startsWith('Reasoning\n') ||
              response.message.content.startsWith('Рассуждение\n') ||
              response.message.reasoning_content?.startsWith('Reasoning\n') ||
              response.message.reasoning_content?.startsWith('Рассуждение\n'))
          ) {
            logger.info({
              location: 'checkG4FModelSubstitution',
              message: `Detected model substitution for account ${g4fAccount.name}`,
              prompt,
              response: {
                content: response.message.content,
                reasoning_content: response.message.reasoning_content,
              },
            })
            return {
              status: ModelAccountModelStatus.INACTIVE,
            }
          }

          return {
            status: ModelAccountModelStatus.ACTIVE,
          }
        } catch (error) {
          if (
            error instanceof BaseError &&
            ['G4F_NO_VALID_HAR_FILE', 'G4F_NO_VALID_ACCESS_TOKEN'].includes(error.code ?? '')
          ) {
            if (!devMode) {
              tgNotificationBotGateway.send(
                `Аккаунт ${g4fAccount.name} неактивен. Причина: ${error.code}`,
                TgBotParseMode.HTML,
              )
            }

            await modelAccountRepository.update({
              where: { id: g4fAccount.id },
              data: {
                status: ModelAccountStatus.INACTIVE,
              },
            })

            queueManager.addUpdateModelAccountHARFileJob({ modelAccountId: g4fAccount.id })
          }

          logger.error({
            location: 'checkG4FModelSubstitution',
            message: getErrorString(error),
          })

          return {}
        }
      }

      await Promise.all(
        accounts.map(async (account) => {
          if (
            !account.g4f_api_url ||
            !account.models ||
            account.models.every(
              (accountModel) =>
                (accountModel.status === ModelAccountModelStatus.INACTIVE &&
                  accountModel.status_reason !==
                    ModelAccountModelStatusReason.G4F_MODEL_SUBSTITUTION) ||
                accountModel.model_id === 'gpt-4o-mini' ||
                accountModel.disabled_at,
            )
          ) {
            return
          }

          let testAccountModel: AccountModel | null =
            account.models.find((accountModel) => accountModel.model_id === 'o4-mini') ?? null

          if (!testAccountModel) {
            const childProvider = account.models.reduce<null | IModelProvider>(
              (acc, accountModel) => {
                if (accountModel.model?.child_provider?.name) {
                  return accountModel.model.child_provider
                }

                return acc
              },
              null,
            )

            if (!childProvider) {
              return
            }

            testAccountModel = {
              id: null,
              model: {
                id: 'o4-mini',
                child_provider: childProvider,
                provider_id: config.model_providers.g4f.id,
              },
              disabled_at: null,
              status: ModelAccountModelStatus.ACTIVE,
              status_reason: null,
            }
          }

          const { status } = await getAccountModelStatus(account, testAccountModel)

          if (!status) {
            return
          }

          const accountModelsToUpdate = account.models
            .filter((accountModel) => {
              if (!accountModel.model_id || accountModel.disabled_at) {
                return false
              }
              if (['gpt-4o-mini', 'o4-mini'].includes(accountModel.model_id)) {
                return false
              }
              // Do not enable models which was disabled by other reason
              if (
                status === ModelAccountModelStatus.ACTIVE &&
                accountModel.status_reason !== ModelAccountModelStatusReason.G4F_MODEL_SUBSTITUTION
              ) {
                return false
              }

              return accountModel.status !== status
            })
            .map((model) => ({ id: model.id, model_id: model.model_id }))

          if (
            testAccountModel.id &&
            testAccountModel?.model?.id &&
            testAccountModel.status !== status &&
            !(
              status === ModelAccountModelStatus.ACTIVE &&
              testAccountModel.status_reason !==
                ModelAccountModelStatusReason.G4F_MODEL_SUBSTITUTION
            ) &&
            !testAccountModel.disabled_at
          ) {
            accountModelsToUpdate.push({
              id: testAccountModel.id,
              model_id: testAccountModel.model.id,
            })
          }

          if (accountModelsToUpdate.length === 0) {
            return
          }

          const modelNames = accountModelsToUpdate.map((model) => model.model_id).join(', ')
          if (status === ModelAccountModelStatus.INACTIVE) {
            logger.info({
              location: 'checkG4FModelSubstitution',
              message: `Detected model substitution, disabling ${modelNames} for ${account.name}`,
            })

            if (!devMode) {
              tgNotificationBotGateway.send(
                `Обнаружена подмена модели. Отключение моделей ${modelNames} в аккаунте ${account.name}. Включите модели после того как удостоверитесь, что модели отвечают верно`,
                TgBotParseMode.HTML,
              )
            }
          } else {
            logger.info({
              location: 'checkG4FModelSubstitution',
              message: `No model substitution detected, enabling models (${modelNames}) on account ${account.name}`,
            })

            if (!devMode) {
              tgNotificationBotGateway.send(
                `Подмена модели не обнаружена. Включение моделей ${modelNames} в аккаунте ${account.name}.`,
                TgBotParseMode.HTML,
              )
            }
          }

          await modelAccountModelRepository.updateMany({
            where: { id: { in: accountModelsToUpdate.map((accountModel) => accountModel.id) } },
            data: {
              status,
              status_reason:
                status === ModelAccountModelStatus.INACTIVE
                  ? ModelAccountModelStatusReason.G4F_MODEL_SUBSTITUTION
                  : 'RECOVERED_AFTER_MODEL_SUBSTITUTION',
            },
          })
        }),
      )
    } catch (error) {
      logger.error({
        location: 'checkG4FModelSubstitutions',
        message: getErrorString(error),
      })
    }
  }
}

const prompts = [
  'How operating system scheduler works',
  'What is a paradox? Give an example',
  'To be or not to be?',
  'How to profile Node.js clusterized application in production?',
  'How to compute EBITDA',
  'How to to find basis of the matrix with certain precision?',
  'What is laplassian in math?',

  'Prove that the square root of 2 is irrational',
  'Explain why 0.999... equals 1',
  'How to solve a system of linear equations using Gaussian elimination',
  'What is the relationship between eigenvalues and matrix determinant?',

  'Compare time complexity of different sorting algorithms and when to use each',
  'How does a hash table handle collisions and maintain O(1) lookup?',
  'Explain the CAP theorem and its implications for distributed systems',
  'How does garbage collection work in different programming languages?',

  'What is the trolley problem and what ethical frameworks apply?',
  'Explain the ship of Theseus paradox and its implications',
  "How does Gödel's incompleteness theorem affect mathematics?",
  'What is the hard problem of consciousness?',

  "Why can't information travel faster than light?",
  'How does quantum entanglement work without violating relativity?',
  'Explain the double-slit experiment and wave-particle duality',
  'What causes the greenhouse effect at a molecular level?',

  'How does compound interest demonstrate exponential growth?',
  'Explain the efficient market hypothesis and its criticisms',
  'What causes inflation and how do central banks control it?',
  'How do options pricing models like Black-Scholes work?',

  'How do TCP congestion control algorithms prevent network collapse?',
  'Why do bridges need expansion joints and how are they designed?',
  'How does error correction work in digital communication?',
  'What are the tradeoffs between different database consistency models?',

  'You have 8 balls, one is heavier. Find it using a balance scale in minimum weighings',
  'How would you design a URL shortener like bit.ly at scale?',
  'A snail climbs 3 feet up a 30-foot wall each day but slides back 2 feet each night. When does it reach the top?',
  'How many piano tuners are there in Chicago? (Fermi estimation)',
]
