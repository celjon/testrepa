import { Response } from 'express'
import { DeliveryParams } from '@/delivery/types'
import { AuthRequest } from '../types'
import { NotFoundError } from '@/domain/errors'

type Params = Pick<DeliveryParams, 'seoArticleProofreading'>

export type CreateManySEOArticleProofreading = (req: AuthRequest, res: Response) => Promise<void>

export const buildCreateManySEOArticleProofreading = ({
  seoArticleProofreading,
}: Params): CreateManySEOArticleProofreading => {
  return async (req, res) => {
    const { articleIds, expert_id } = req.body

    try {
      if (!articleIds || !Array.isArray(articleIds) || articleIds.length === 0) {
        throw new NotFoundError({
          code: 'NO_ARTICLE_IDS_PROVIDED',
        })
      }

      const proofreadings = articleIds.map((article_id) => ({
        expert_id,
        article_id,
      }))
      const createdCount = await seoArticleProofreading.createManySEOArticleProofreading({
        proofreadings,
      })
      res.status(201).json({ message: `${createdCount} proofreadings created successfully.` })
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Undefined error'
      res.status(500).json({ message: msg })
    }
  }
}
