import { DeliveryParams } from '@/delivery/types'
import { IJob } from '../../types'
import cron from 'node-cron'
import { buildUpdateSpentInMonth, UpdateSpentInMonth } from './update-spent-in-month'

type Params = Pick<DeliveryParams, 'enterprise'>

type EmployeeMethods = {
  updateSpentInMonth: UpdateSpentInMonth
}

const buildStart = (methods: EmployeeMethods) => {
  return () => {
    cron.schedule('0 1 1 * *', () => {
      methods.updateSpentInMonth()
    })
  }
}

export const buildEmployeeJob = (params: Params): IJob => {
  return {
    start: buildStart({
      updateSpentInMonth: buildUpdateSpentInMonth(params),
    }),
  }
}
