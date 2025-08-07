import Express from 'express'
import { DeliveryParams } from '@/delivery/types'
import { Middlewares } from '../../middlewares'
import { createRouteHandler } from '../../routeHandler'
import { IHandler } from '../types'
import { buildDataAnalysisRules } from './rules'
import {
  buildClusterizeExcel,
  buildClusterizeExcelMiddleware,
  ClusterizeExcel,
} from './clusterize-excel'

type Params = Pick<DeliveryParams, 'dataAnalysis' | 'middlewares'>

export type DataAnalysisMethods = {
  clusterizeExcel: ClusterizeExcel
}

const buildRegisterRoutes = (methods: DataAnalysisMethods, middlewares: Middlewares) => {
  const { clusterizeExcelRules } = buildDataAnalysisRules(middlewares)

  const clusterizeExcelMiddleware = buildClusterizeExcelMiddleware(middlewares)

  return (root: Express.Router) => {
    const namespace = Express.Router()

    /**
     * @openapi
     * /data-analysis/clusterize-excel:
     *   post:
     *     tags: [Excel Processing]
     *     summary: Processes an Excel file and performs clustering on the data.
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       description: Excel file and parameters for processing
     *       content:
     *         multipart/form-data:
     *           schema:
     *             type: object
     *             properties:
     *               file:
     *                 type: string
     *                 format: binary
     *                 description: The Excel file for processing
     *               sheet_name:
     *                 type: string
     *                 description: The name of the sheet in the Excel file to process
     *               column_name:
     *                 type: string
     *                 description: The name of the column containing the text data
     *     responses:
     *       '200':
     *         description: Successfully processed Excel file and clustered data
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 topics:
     *                   type: array
     *                   items:
     *                     type: object
     *                     properties:
     *                       topic_id:
     *                         type: integer
     *                         description: The ID of the topic
     *                       percentage:
     *                         type: number
     *                         format: float
     *                         description: The percentage of the topic in the data
     *                       rows_count:
     *                         type: integer
     *                         description: The count of occurrences for the topic
     *                       examples:
     *                         type: array
     *                         items:
     *                           type: string
     *                         description: Example rows for the topic
     *                 noise:
     *                   type: object
     *                   properties:
     *                     topic_id:
     *                       type: integer
     *                       enum: [-1]
     *                       description: The ID for noise, always -1
     *                     percentage:
     *                       type: number
     *                       format: float
     *                       description: The percentage of noise in the data
     *                     rows_count:
     *                       type: integer
     *                       description: The count of noise occurrences
     *                     examples:
     *                       type: array
     *                       items:
     *                         type: string
     *                       description: Example rows for noise
     *                 stats:
     *                   type: object
     *                   properties:
     *                     total_rows:
     *                       type: integer
     *                       description: The total number of rows in the dataset
     *                     silhouette_score:
     *                       type: number
     *                       format: float
     *                       description: The silhouette score for the clustering
     *                     identified_topics:
     *                       type: integer
     *                       description: The number of identified topics
     *       '400':
     *         description: Bad request (invalid file format or missing file)
     *       '500':
     *         description: Internal server error
     */
    namespace.post(
      '/clusterize-excel',
      clusterizeExcelMiddleware,
      clusterizeExcelRules,
      createRouteHandler(methods.clusterizeExcel),
    )

    root.use('/data-analysis', namespace)
  }
}

export const buildDataAnalysisHandler = (params: Params): IHandler => {
  return {
    registerRoutes: buildRegisterRoutes(
      {
        clusterizeExcel: buildClusterizeExcel(params),
      },
      params.middlewares,
    ),
  }
}
