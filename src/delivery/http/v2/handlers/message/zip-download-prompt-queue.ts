import { Response } from 'express'
import { AuthRequest } from '../types'
import { DeliveryParams } from '@/delivery/types'

type Params = Pick<DeliveryParams, 'storageGateway'>

export type ZipDownloadPromptQueue = (req: AuthRequest, res: Response) => Promise<Response>

export const buildZipDownloadPromptQueue = ({ storageGateway }: Params): ZipDownloadPromptQueue => {
  return async (req, res) => {
    const path = req.query.path as string
    const zipPath = await storageGateway.getTemporaryPath({ path, ttlMs: 6000000 })
    const zipBuffer = await storageGateway.read({ path: zipPath })
    if (!zipBuffer) {
      return res.status(404).json({ error: 'Архив не найден или ещё не готов' })
    }
    res.setHeader('Content-Type', 'application/zip')
    res.setHeader('Content-Disposition', `attachment; filename="responses_${path}"`)
    res.send(zipBuffer)
    return res
  }
}
