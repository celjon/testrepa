import { check } from 'express-validator'
import { Middlewares } from '../../middlewares'
import { config } from '@/config'

export const buildPresetRules = ({ allowedIps, authRequired, validateSchema }: Middlewares) => {
  /**
   * @openapi
   * components:
   *   rules:
   *      createPreset:
   *          required:
   *          properties:
   *             name:
   *                type: string
   *             description:
   *                type: string
   *             modelId:
   *                type: string
   *             systemPrompt:
   *                type: string
   *             access:
   *                type: string
   *                enum: [PUBLIC, PRIVATE]
   *             categoriesIds:
   *                type: array
   *                items: string
   *                example: []
   */
  const createRules = [
    check('name').isString(),
    check('description').isString(),
    check('systemPrompt').isString(),
    check('access').isString(),
    // array can be empty
    check('categoriesIds').optional().isArray(),
    authRequired(),
    validateSchema
  ]

  const deleteRules = [authRequired(), validateSchema]

  /**
   * @openapi
   * components:
   *   rules:
   *      updatePreset:
   *          required:
   *          properties:
   *             name:
   *                type: string
   *             description:
   *                type: string
   *             modelId:
   *                type: string
   *             systemPrompt:
   *                type: string
   *             attachmentsIds:
   *                type: array
   *                items: string
   *                example: []
   *             access:
   *                type: string
   *                enum: [PUBLIC, PRIVATE]
   *             categoriesIds:
   *                type: array
   *                items: string
   *                example: []
   */
  const updateRules = [
    check('name').optional().isString(),
    check('description').optional().isString(),
    check('systemPrompt').optional().isString(),
    check('attachmentsIds').optional().isArray(),
    check('access').optional().isString(),
    check('categoriesIds').optional().isArray(),
    authRequired(),
    validateSchema
  ]

  const listRules = [
    check('search').optional().isString(),
    check('favorite').optional().isString(),
    check('page').optional().isString(),
    check('quantity').optional().isString(),
    check('locale').optional().isString(),
    authRequired(),
    validateSchema
  ]

  /**
   * @openapi
   * components:
   *   rules:
   *      createPresetCategory:
   *          required:
   *          properties:
   *             code:
   *                type: string
   *             locale:
   *                type: string
   *             name:
   *                type: string
   */
  const createCategoryRules = [
    check('code').isString(),
    check('locale').optional().isString(),
    check('name').isString(),
    allowedIps(config.admin.allowed_ips),
    validateSchema
  ]

  /**
   * @openapi
   * components:
   *   rules:
   *      updatePresetCategory:
   *          required:
   *          properties:
   *             code:
   *                type: string
   *             locale:
   *                type: string
   *             name:
   *                type: string
   */
  const updateCategoryRules = [
    check('code').optional().isString(),
    check('locale').optional().isString(),
    check('name').optional().isString(),
    allowedIps(config.admin.allowed_ips),
    validateSchema
  ]

  const getCategoriesRules = [check('locale').optional().isString(), validateSchema]

  const deleteCategoryRules = [allowedIps(config.admin.allowed_ips), validateSchema]

  const favoriteRules = [authRequired(), validateSchema]

  const unfavoriteRules = [authRequired(), validateSchema]

  const getFiltersRules = [check('locale').optional().isString(), validateSchema]

  const createChatRules = [check('chatId').optional().isString(), authRequired(), validateSchema]

  return {
    createRules,
    deleteRules,
    updateRules,
    listRules,
    createCategoryRules,
    updateCategoryRules,
    getCategoriesRules,
    deleteCategoryRules,
    favoriteRules,
    unfavoriteRules,
    getFiltersRules,
    createChatRules
  }
}
