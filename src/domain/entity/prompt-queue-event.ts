import { Subject, Subscription } from 'rxjs'

export interface ProgressEventPayload {}

/**
 * @openapi
 * components:
 *   entities:
 *      PromptQueueEvent:
 *          required:
 *            - id
 *            - name
 *            - data
 *          properties:
 *            id:
 *              type: string
 *            data:
 *              type: object
 */
export type IPromptQueueEvent = {
  donePrompts?: number
  totalPrompts?: number
  error?: string
  path?: string
  done?: boolean
  cancelled?: boolean
}

export type PromptQueueCloseEventStreamFunction = (options: { subscription: Subscription }) => void

export interface IPromptQueueEventStream {
  id: string
  subject: Subject<IPromptQueueEvent>
  close: PromptQueueCloseEventStreamFunction
}

export type PromptQueueStreamMap = Record<string, IPromptQueueEventStream>
