import { IHandler } from '../types'
import Express from 'express'
import { createRouteHandler } from '../../routeHandler'
import { DeliveryParams } from '@/delivery/types'
import { buildCreate, buildCreateMiddleware, Create } from './create'
import { buildList, List } from './list'
import { buildPresetRules } from './rules'
import { buildDelete, Delete } from './delete'
import { buildUpdate, buildUpdateMiddleware, Update } from './update'
import { buildCreateCategory, CreateCategory } from './create-category'
import { buildUpdateCategory, UpdateCategory } from './update-category'
import { buildDeleteCategory, DeleteCategory } from './delete-category'
import { buildGetCategories, GetCategories } from './get-categories'
import { buildFavorite, Favorite } from './favorite'
import { buildUnfavorite, Unfavorite } from './unfavorite'
import { buildGetFilters, GetFilters } from './get-filters'
import { buildCreateChat, CreateChat } from './create-chat'
import { Middlewares } from '../../middlewares'

type Params = Pick<DeliveryParams, 'preset' | 'middlewares'>

export type PresetMethods = {
  create: Create
  delete: Delete
  update: Update
  list: List
  createCategory: CreateCategory
  updateCategory: UpdateCategory
  deleteCategory: DeleteCategory
  getCategories: GetCategories
  favorite: Favorite
  unfavorite: Unfavorite
  getFilters: GetFilters
  createChat: CreateChat
}

const buildRegisterRoutes = (methods: PresetMethods, middlewares: Middlewares) => {
  const {
    createCategoryRules,
    createRules,
    createChatRules,
    deleteCategoryRules,
    deleteRules,
    favoriteRules,
    getCategoriesRules,
    getFiltersRules,
    listRules,
    updateCategoryRules,
    updateRules,
  } = buildPresetRules(middlewares)
  const updateMiddleware = buildUpdateMiddleware(middlewares)
  const createMiddleware = buildCreateMiddleware(middlewares)

  return (root: Express.Router) => {
    const namespace = Express.Router()

    /**
     * @openapi
     * /preset:
     *   post:
     *     security:
     *      - bearerAuth: []
     *     tags: [Preset]
     *     produces:
     *       - application/json
     *     requestBody:
     *       required: true
     *       content:
     *        application/json:
     *          schema:
     *            $ref: '#/components/rules/createPreset'
     *     responses:
     *        200:
     *           content:
     *              application/json:
     *                schema:
     *                      $ref: '#/components/entities/Preset'
     */
    namespace.post('/', createMiddleware, createRules, createRouteHandler(methods.create))

    /**
     * @openapi
     * /preset/{id}:
     *   delete:
     *     tags: [Preset]
     *     security:
     *      - bearerAuth: []
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: id
     *         in: path
     *         required: true
     *         type: string
     *     responses:
     *        200:
     *           content:
     *              application/json:
     *                schema:
     *                      $ref: '#/components/entities/Preset'
     */
    namespace.delete('/:id', deleteRules, createRouteHandler(methods.delete))

    /**
     * @openapi
     * /preset/{id}:
     *   patch:
     *     tags: [Preset]
     *     security:
     *      - bearerAuth: []
     *     produces:
     *       - application/json
     *     requestBody:
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/rules/updatePreset'
     *     parameters:
     *       - name: id
     *         in: path
     *         required: true
     *         type: string
     *     responses:
     *        200:
     *           content:
     *              application/json:
     *                schema:
     *                      $ref: '#/components/entities/Preset'
     */
    namespace.patch('/:id', updateMiddleware, updateRules, createRouteHandler(methods.update))

    /**
     * @openapi
     * /preset/list:
     *   get:
     *     tags: [Preset]
     *     security:
     *      - bearerAuth: []
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: search
     *         in: query
     *         type: string
     *       - name: page
     *         in: query
     *         type: number
     *       - name: favorite
     *         in: query
     *         type: number
     *       - name: quantity
     *         in: query
     *         type: number
     *       - name: locale
     *         in: query
     *         type: number
     *     responses:
     *        200:
     *           content:
     *              application/json:
     *                schema:
     *                    properties:
     *                        data:
     *                          type: array
     *                          items:
     *                            $ref: '#/components/entities/Preset'
     *                        pages:
     *                          type: number
     */
    namespace.get('/list', listRules, createRouteHandler(methods.list))

    /**
     * @openapi
     * /preset/category:
     *   post:
     *     security:
     *      - bearerAuth: []
     *     tags: [Preset]
     *     produces:
     *       - application/json
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/rules/createPresetCategory'
     *     responses:
     *        200:
     *           content:
     *              application/json:
     *                schema:
     *                  $ref: '#/components/entities/PresetCategory'
     */
    namespace.post('/category', createCategoryRules, createRouteHandler(methods.createCategory))

    /**
     * @openapi
     * /preset/category/{id}:
     *   delete:
     *     tags: [Preset]
     *     security:
     *      - bearerAuth: []
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: id
     *         in: path
     *         required: true
     *         type: string
     *     responses:
     *        200:
     *           content:
     *              application/json:
     *                schema:
     *                      $ref: '#/components/entities/PresetCategory'
     */
    namespace.delete(
      '/category/:id',
      deleteCategoryRules,
      createRouteHandler(methods.deleteCategory),
    )

    /**
     * @openapi
     * /preset/category/{id}:
     *   patch:
     *     tags: [Preset]
     *     security:
     *      - bearerAuth: []
     *     produces:
     *       - application/json
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/rules/updatePresetCategory'
     *     parameters:
     *       - name: id
     *         in: path
     *         required: true
     *         type: string
     *     responses:
     *        200:
     *           content:
     *              application/json:
     *                schema:
     *                      $ref: '#/components/entities/PresetCategory'
     */
    namespace.patch(
      '/category/:id',
      updateCategoryRules,
      createRouteHandler(methods.updateCategory),
    )

    /**
     * @openapi
     * /preset/category/list:
     *   get:
     *     tags: [Preset]
     *     security:
     *      - bearerAuth: []
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: locale
     *         in: query
     *         required: false
     *         type: string
     *     responses:
     *        200:
     *           content:
     *              application/json:
     *                schema:
     *                    properties:
     *                        type: array
     *                        items:
     *                            $ref: '#/components/entities/PresetCategory'
     */
    namespace.get('/category/list', getCategoriesRules, createRouteHandler(methods.getCategories))

    /**
     * @openapi
     * /preset/{id}/favorite:
     *   post:
     *     tags: [Preset]
     *     security:
     *      - bearerAuth: []
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: id
     *         in: path
     *         required: true
     *         type: string
     *     responses:
     *        200:
     *           content:
     *              application/json:
     *                schema:
     *                      $ref: '#/components/entities/Preset'
     */
    namespace.post('/:id/favorite', favoriteRules, createRouteHandler(methods.favorite))

    /**
     * @openapi
     * /preset/{id}/unfavorite:
     *   post:
     *     tags: [Preset]
     *     security:
     *      - bearerAuth: []
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: id
     *         in: path
     *         required: true
     *         type: string
     *     responses:
     *        200:
     *           content:
     *              application/json:
     *                schema:
     *                      $ref: '#/components/entities/Preset'
     */
    namespace.post('/:id/unfavorite', favoriteRules, createRouteHandler(methods.unfavorite))

    /**
     * @openapi
     * /preset/filters:
     *   get:
     *     tags: [Preset]
     *     security:
     *      - bearerAuth: []
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: locale
     *         in: query
     *         required: false
     *         type: string
     *     responses:
     *        200:
     *           content:
     *              application/json:
     *                schema:
     *                    properties:
     *                        categories:
     *                            type: array
     *                            items:
     *                                $ref: '#/components/entities/PresetFilter'
     *                        models:
     *                            type: array
     *                            items:
     *                                $ref: '#/components/entities/PresetFilter'
     */
    namespace.get('/filters', getFiltersRules, createRouteHandler(methods.getFilters))

    /**
     * @openapi
     * /preset/{id}/chat:
     *   post:
     *     tags: [Preset]
     *     security:
     *      - bearerAuth: []
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: id
     *         in: path
     *         required: true
     *         type: string
     *     responses:
     *        200:
     *           content:
     *              application/json:
     *                schema:
     *                      $ref: '#/components/entities/Chat'
     */
    namespace.post('/:id/chat', createChatRules, createRouteHandler(methods.createChat))

    root.use('/preset', namespace)
  }
}

export const buildPresetHandler = (params: Params): IHandler => {
  const create = buildCreate(params)
  const deletePreset = buildDelete(params)
  const update = buildUpdate(params)
  const list = buildList(params)
  const createCategory = buildCreateCategory(params)
  const deleteCategory = buildDeleteCategory(params)
  const updateCategory = buildUpdateCategory(params)
  const getCategories = buildGetCategories(params)
  const favorite = buildFavorite(params)
  const unfavorite = buildUnfavorite(params)
  const getFilters = buildGetFilters(params)
  const createChat = buildCreateChat(params)

  return {
    registerRoutes: buildRegisterRoutes(
      {
        create,
        delete: deletePreset,
        update,
        list,
        createCategory,
        deleteCategory,
        updateCategory,
        getCategories,
        favorite,
        unfavorite,
        getFilters,
        createChat,
      },
      params.middlewares,
    ),
  }
}
