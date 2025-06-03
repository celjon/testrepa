import { DeliveryParams } from '@/delivery/types'

type Params = Pick<DeliveryParams, 'model'>

export type Init = () => void

export const buildInit = ({ model }: Params): Init => {
  return async () => {
    await model.init()
  }
}
