import { Response } from 'express'
import { ModelAccountStatus } from '@prisma/client'
import { DeliveryParams } from '@/delivery/types'
import { AuthRequest } from '../types'
import { parseNullableNumber } from '@/lib/utils/parse-nullable-number'

type Params = Pick<DeliveryParams, 'model'>

export type UpdateAccount = (req: AuthRequest, res: Response) => Promise<Response>

export const buildUpdateAccount = ({ model }: Params): UpdateAccount => {
  return async (req, res) => {
    const account = await model.updateAccount({
      ...req.body,
      id: req.params.id,
      ...(typeof req.body.mjConcurrency === 'string' && {
        mjConcurrency: +req.body.mjConcurrency,
      }),
      disabledAt:
        req.body.disabled_at === 'null'
          ? null
          : typeof req.body.disabled_at === 'string'
            ? new Date()
            : undefined,
      g4fOnlinePhaseSeconds: parseNullableNumber(req.body.g4fOnlinePhaseSeconds),
      g4fOfflinePhaseSeconds: parseNullableNumber(req.body.g4fOfflinePhaseSeconds),
      ...(typeof req.body.usageCountLimit === 'string' && {
        usageCountLimit: +req.body.usageCountLimit,
      }),
      usageResetIntervalSeconds: parseNullableNumber(req.body.usageResetIntervalSeconds),
      ...(req.body.status && {
        status: req.body.status as ModelAccountStatus,
      }),
      ...(req.file && {
        g4fHarFile: req.file,
      }),
    })

    return res.status(200).json(account)
  }
}
