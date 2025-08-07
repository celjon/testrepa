import swaggerJSDoc, { Options } from 'swagger-jsdoc'
import Express from 'express'
import swaggerUI from 'swagger-ui-express'
import path from 'path'

const schemaFileExtension = process.env.NODE_ENV == 'production' ? 'js' : 'ts'
const rootFolder = process.env.NODE_ENV == 'production' ? './build/src' : './src'

export const options: Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Bothub API',
      version: '2.0.0',
    },
    servers: [{ url: '/api/v2' }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: [
    path.join(rootFolder, `delivery/http/v2/handlers/**/*.${schemaFileExtension}`),
    path.join(rootFolder, `domain/entity/**/*.${schemaFileExtension}`),
  ],
}

export const buildSwagger = () => {
  const swagger = Express.Router()

  const openapiSpecification = swaggerJSDoc(options)

  swagger.use('/swagger', swaggerUI.serve, swaggerUI.setup(swaggerJSDoc(options)))
  swagger.get('/swagger.json', (req, res) => {
    res.status(200).json(openapiSpecification)
  })

  return swagger
}
