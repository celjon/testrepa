import { Response } from 'express'
import { DeliveryParams } from '@/delivery/types'
import { AuthRequest } from '../types'

type Params = Pick<DeliveryParams, 'healthCheckGateway'>

export const buildHealthCheckHandlers = ({ healthCheckGateway }: Params) => {
  return {
    checkDB: async (_: AuthRequest, res: Response) => {
      const result = await healthCheckGateway.checkDB()

      return res.status(200).json(result)
    },
    getEventLoopLag: async (_: AuthRequest, res: Response) => {
      const result = await healthCheckGateway.getEventLoopLag()

      return res.status(200).json(result)
    },
    getEventLoopUtilization: async (_: AuthRequest, res: Response) => {
      const result = await healthCheckGateway.getEventLoopUtilization()

      return res.status(200).json(result)
    },
    getMemoryUsage: async (_: AuthRequest, res: Response) => {
      const result = await healthCheckGateway.getMemoryUsage()

      return res.status(200).json(result)
    }
  }
}
