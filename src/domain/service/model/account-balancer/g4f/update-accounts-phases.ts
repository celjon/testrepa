import { ModelAccountAuthType, ModelAccountStatus } from '@prisma/client'
import { config } from '@/config'
import { getErrorString } from '@/lib'
import { logger } from '@/lib/logger'
import { Adapter } from '@/domain/types'
import { g4fIsOfflinePhase, g4fIsOnlinePhase } from '@/domain/entity/model-account'

type Params = Pick<Adapter, 'modelAccountRepository'>

export type UpdateAccountsPhases = () => Promise<void>

export const buildUpdateAccountsPhases = ({
  modelAccountRepository,
}: Params): UpdateAccountsPhases => {
  return async () => {
    try {
      const g4fAccounts = await modelAccountRepository.list({
        where: {
          queue: {
            provider: {
              parent_id: config.model_providers.g4f.id,
            },
          },
          auth_type: ModelAccountAuthType.HAR_FILE,
        },
      })

      const now = new Date()

      const offlineAccounts = g4fAccounts.filter((account) => {
        if (!g4fIsOnlinePhase(account.status) || !account.g4f_online_phase_seconds) {
          return false
        }

        const nextPhaseChange = account.g4f_phase_updated_at
          ? new Date(
              account.g4f_phase_updated_at.getTime() + account.g4f_online_phase_seconds * 1000,
            )
          : now

        return now >= nextPhaseChange
      })

      const onlineAccounts = g4fAccounts.filter((account) => {
        if (!g4fIsOfflinePhase(account.status) || !account.g4f_offline_phase_seconds) {
          return false
        }

        const nextPhaseChange = account.g4f_phase_updated_at
          ? new Date(
              account.g4f_phase_updated_at.getTime() + account.g4f_offline_phase_seconds * 1000,
            )
          : now

        return now >= nextPhaseChange
      })

      const g4fPhaseUpdatedAt = roundToHour(new Date())

      await Promise.all([
        offlineAccounts.length > 0 &&
          modelAccountRepository.updateMany({
            where: { id: { in: offlineAccounts.map((account) => account.id) } },
            data: {
              status: ModelAccountStatus.OFFLINE,
              g4f_phase_updated_at: g4fPhaseUpdatedAt,
            },
          }),
        onlineAccounts.length > 0 &&
          modelAccountRepository.updateMany({
            where: { id: { in: onlineAccounts.map((account) => account.id) } },
            data: {
              status: ModelAccountStatus.ACTIVE,
              g4f_phase_updated_at: g4fPhaseUpdatedAt,
            },
          }),
      ])
      logger.info({
        location: 'g4f.updateAccountsPhases',
        message: `Set ${onlineAccounts.length} accounts online, ${offlineAccounts.length} offline`,
      })
    } catch (error) {
      logger.error({
        location: 'g4f.updateAccountsPhases',
        message: getErrorString(error),
      })
    }
  }
}

const roundToHour = (date: Date): Date => {
  const rounded = new Date(date)
  rounded.setMinutes(0, 0, 0)
  return rounded
}
