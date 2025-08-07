import { DeliveryParams } from '@/delivery/types'

type Params = Pick<DeliveryParams, 'model'>

export type CheckModelSubstitutions = () => Promise<void>

export const buildCheckModelSubstitutions = ({ model }: Params): CheckModelSubstitutions => {
  return () => {
    return model.checkG4FModelSubstitutions()
  }
}
