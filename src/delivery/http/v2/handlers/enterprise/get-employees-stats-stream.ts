import { Response } from 'express'
import { setSSEHeaders } from '@/lib'
import { logger } from '@/lib/logger'
import { DeliveryParams } from '@/delivery/types'
import { AuthRequest } from '../types'
import { prepareSortParams } from '@/domain/service/enterprise/get-employees-stats-observable'

type Params = Pick<DeliveryParams, 'enterprise'>

export type GetEmployeesStatsStream = (req: AuthRequest, res: Response) => Promise<void>

export const buildGetEmployeesStatsStream = ({ enterprise }: Params): GetEmployeesStatsStream => {
  return async (req, res) => {
    const { responseStream$, closeStream } = await enterprise.getEmployeesStatsStream({
      search: req.query.search as string,
      userId: req.user?.id,
      enterpriseId: req.params.id,
      from: req.query.from ? new Date(req.query.from as string) : new Date(),
      to: req.query.to ? new Date(req.query.to as string) : new Date(),
      sort: prepareSortParams(req.query.sort as string),
      includeTransactions: !!req.query.includeTransactions,
    })

    setSSEHeaders(res)

    const subscription = responseStream$.subscribe({
      next: (data) => {
        res.write(`data: ${JSON.stringify(data)}\n\n`)
      },
      error: (error) => {
        res.write(`error: ${error?.message || 'unknown'}\n`)
        res.write(`data: ${JSON.stringify(error)}\n\n`)
        res.write('[DONE]')
        res.end()
      },
      complete: () => {
        res.write('[DONE]')
        res.end()
      },
    })

    req.on('error', () => {
      logger.warn({
        location: 'enterprise.getEmployeesStatsStream',
        message: 'Unexpected sse connection error',
      })
    })

    req.socket.on('close', () => {
      closeStream()
      subscription.unsubscribe()
    })
  }
}
