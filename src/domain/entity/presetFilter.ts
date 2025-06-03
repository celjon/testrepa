import { IModel } from './model'
import { IPresetCategory } from './presetCategory'

/**
 * @openapi
 * components:
 *   entities:
 *      PresetFilter:
 *          required:
 *            - id
 *            - name
 *            - value
 *            - item_count
 *            - created_at
 *          properties:
 *            id:
 *                type: string
 *            name:
 *                type: string
 *            value:
 *                type: string
 *            item_count:
 *                type: number
 *            created_at:
 *                type: string
 *                format: date
 */
export interface IPresetFilter {
  id: string
  name: string
  value: string
  item_count: number
  category_id?: string | null
  category?: IPresetCategory | null
  model_id?: string | null
  model?: IModel | null
}
