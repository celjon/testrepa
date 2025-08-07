import { DeliveryParams } from '@/delivery/types'

type Params = Pick<DeliveryParams, 'enterprise'>

export type UpdateSpentInMonth = () => void

export const buildUpdateSpentInMonth = ({ enterprise }: Params): UpdateSpentInMonth => {
  return () => enterprise.updateSpentInMonth()
}
