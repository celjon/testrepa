import { NextFunction, Request, Response } from 'express'
import { DeliveryParams } from '@/delivery/types'
import { Middlewares } from '@/delivery/http/v2/middlewares'
import { InvalidDataError } from '@/domain/errors'
import { AuthRequest } from '../types'

type Params = Pick<DeliveryParams, 'dataAnalysis'>

export type ClusterizeExcel = (req: AuthRequest, res: Response) => Promise<Response>

export const buildClusterizeExcelMiddleware = ({ fileUpload }: Middlewares) => {
  const webFilesMiddleware = fileUpload({ saveFiles: false }).fields([
    {
      name: 'excel_file',
      maxCount: 1
    }
  ])

  return (req: Request, res: Response, next: NextFunction) => {
    return webFilesMiddleware(req, res, next)
  }
}

export const buildClusterizeExcel = ({ dataAnalysis }: Params): ClusterizeExcel => {
  return async (req, res) => {
    if (!req.files || Array.isArray(req.files)) {
      throw new InvalidDataError({
        code: 'FILE_ERROR',
        message: `No file is provided or too many files`
      })
    }

    const excelFile = req.files.excel_file?.[0] ?? null
    if (!excelFile) {
      throw new InvalidDataError({
        code: 'FILE_ERROR',
        message: `No file is provided`
      })
    }

    const data = await dataAnalysis.clusterizeExcel({
      userId: req.user?.id,
      excelFile: excelFile,
      sheetName: req.body.sheet_name,
      targetColumns: req.body.target_columns,
    })

    return res.status(200).json(data)
  }
}
