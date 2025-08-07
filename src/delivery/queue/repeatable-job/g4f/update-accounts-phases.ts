import { DeliveryParams } from '@/delivery/types'

type Params = Pick<DeliveryParams, 'model'>

export type UpdateAccountsPhases = () => Promise<void>

export const buildUpdateAccountsPhases = ({ model }: Params): UpdateAccountsPhases => {
  return () => {
    return model.updateG4FAccountsPhases()
  }
}
