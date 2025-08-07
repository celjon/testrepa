import { UseCaseParams } from '../types'

export type GeneratePresignedUrl = (params: { ext: string }) => Promise<{
  id: string
  name: string
  path: string
  url: string
}>

export const buildGeneratePresignedUrl = ({
  adapter: { storageGateway },
}: UseCaseParams): GeneratePresignedUrl => {
  return async ({ ext }) => {
    return await storageGateway.generatePresignedUrl({ ext })
  }
}
