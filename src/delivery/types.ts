import { Adapter } from '@/domain/types'
import { UseCase } from '@/domain/usecase'
import { Middlewares } from './http/v2/middlewares'

export type DeliveryParams = UseCase & Adapter & { middlewares: Middlewares }
