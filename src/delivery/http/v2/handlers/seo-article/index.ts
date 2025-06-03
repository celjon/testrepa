import Express from 'express'
import { DeliveryParams } from '@/delivery/types'
import { createRouteHandler } from '../../routeHandler'
import { IHandler } from '../types'
import { buildFindCategoryOrArticleBySlug, FindCategoryOeArticleBySlug } from './find-category-or-article-by-slug'
import { buildListSEOArticles, ListSEOArticles } from '../seo-article/list'
import { buildListSEOArticlesByCategorySlug, ListSEOArticlesByCategorySlug } from './list-by-category-slug'
import { buildListSEOArticlesByCategoryAndTopicSlug, ListSEOArticlesByCategoryAndTopicSlug } from './list-by-category-and-topic-slug'
import { buildFindBySlug, FindBySlug } from '../seo-article/find-by-slug'
import { Middlewares } from '@/delivery/http/v2/middlewares'
import { buildSEOArticleRules } from './rules'

type Params = Pick<DeliveryParams, 'seoArticleCategory' | 'article' | 'middlewares'>

type SEOArticleMethods = {
  findCategoryOrArticleBySlug: FindCategoryOeArticleBySlug
  listSEOArticles: ListSEOArticles
  listSEOArticlesByCategory: ListSEOArticlesByCategorySlug
  listSEOArticlesByCategoryAndTopic: ListSEOArticlesByCategoryAndTopicSlug
  findBySlug: FindBySlug
}

const buildRegisterRoutes = (methods: SEOArticleMethods, middlewares: Middlewares) => {
  const { findBySlugRules, listSEOArticlesBySlugRules, listSEOArticlesRules, listSEOArticlesByCategoryAndTopicSlugRules } =
    buildSEOArticleRules(middlewares)
  return (root: Express.Router) => {
    const namespace = Express.Router()

    /**
     * @openapi
     * /seo-article/list:
     *   get:
     *     security:
     *       - bearerAuth: []
     *     tags: [SEO Article]
     *     parameters:
     *       - name: search
     *         in: query
     *         schema:
     *           type: string
     *       - name: page
     *         in: query
     *         schema:
     *           type: number
     *       - name: quantity
     *         in: query
     *         schema:
     *           type: number
     *     responses:
     *       200:
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 data:
     *                   type: array
     *                   items:
     *                     $ref: '#/components/entities/Article'
     *                 pages:
     *                   type: integer
     */
    namespace.get('/list', listSEOArticlesRules, createRouteHandler(methods.listSEOArticles))
    /**
     * @openapi
     * /seo-article/list-by-category/{slug}:
     *   get:
     *     security:
     *       - bearerAuth: []
     *     tags: [SEO Article]
     *     parameters:
     *       - name: slug
     *         in: path
     *         required: true
     *         schema:
     *           type: string
     *       - name: page
     *         in: query
     *         schema:
     *           type: number
     *       - name: quantity
     *         in: query
     *         schema:
     *           type: number
     *     responses:
     *       200:
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 data:
     *                   type: array
     *                   items:
     *                     $ref: '#/components/entities/Article'
     *                 pages:
     *                   type: integer
     */
    namespace.get('/list-by-category/:slug', listSEOArticlesBySlugRules, createRouteHandler(methods.listSEOArticlesByCategory))
    /**
     * @openapi
     * /seo-article/list-by-category-and-topic/{categorySlug}/{topicSlug}:
     *   get:
     *     security:
     *       - bearerAuth: []
     *     tags: [SEO Article]
     *     parameters:
     *       - name: categorySlug
     *         in: path
     *         required: true
     *         schema:
     *           type: string
     *       - name: topicSlug
     *         in: path
     *         required: true
     *         schema:
     *           type: string
     *       - name: page
     *         in: query
     *         schema:
     *           type: number
     *       - name: quantity
     *         in: query
     *         schema:
     *           type: number
     *     responses:
     *       200:
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 data:
     *                   type: array
     *                   items:
     *                     $ref: '#/components/entities/Article'
     *                 pages:
     *                   type: integer
     */
    namespace.get(
      '/list-by-category-and-topic/:categorySlug/:topicSlug',
      listSEOArticlesByCategoryAndTopicSlugRules,
      createRouteHandler(methods.listSEOArticlesByCategoryAndTopic)
    )

    /**
     * @openapi
     * /seo-article/find-by-slug/{slug}:
     *   get:
     *     tags: [SEO Article]
     *     parameters:
     *       - name: slug
     *         in: path
     *         required: true
     *         schema:
     *           type: string
     *     responses:
     *       200:
     *         description: Article
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/entities/Article'
     */
    namespace.get('/find-by-slug/:slug', findBySlugRules, createRouteHandler(methods.findBySlug))

    /**
     * @openapi
     * /seo-article/find-category-or-article-by-slug/{slug}:
     *   get:
     *     security:
     *      - bearerAuth: []
     *     tags: [SEO Article]
     *     parameters:
     *       - name: slug
     *         in: path
     *         required: true
     *         schema:
     *           type: string
     *     responses:
     *       200:
     *         description: Category
     *         content:
     *           application/json:
     *             schema:
     *               oneOf:
     *                 - $ref: '#/components/entities/SEOArticleCategory'
     *                 - $ref: '#/components/entities/Article'
     */
    namespace.get('/find-category-or-article-by-slug/:slug', createRouteHandler(methods.findCategoryOrArticleBySlug))

    root.use('/seo-article', namespace)
  }
}

export const buildSEOArticleHandler = (params: Params): IHandler => {
  const findCategoryOrArticleBySlug = buildFindCategoryOrArticleBySlug(params)
  const findBySlug = buildFindBySlug(params)
  const listSEOArticles = buildListSEOArticles(params)
  const listSEOArticlesByCategory = buildListSEOArticlesByCategorySlug(params)
  const listSEOArticlesByCategoryAndTopic = buildListSEOArticlesByCategoryAndTopicSlug(params)

  return {
    registerRoutes: buildRegisterRoutes(
      {
        findCategoryOrArticleBySlug,
        findBySlug,
        listSEOArticles,
        listSEOArticlesByCategory,
        listSEOArticlesByCategoryAndTopic
      },
      params.middlewares
    )
  }
}
