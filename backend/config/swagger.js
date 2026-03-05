import swaggerUi from 'swagger-ui-express';
import j2s from 'joi-to-swagger';
import { createSchemaCliente } from '../modules/cliente/cliente.schema.js';
import express from 'express';

const router = express.Router();

// Convertir el schema de Joi a Swagger
const { swagger: clienteSwagger } = j2s(createSchemaCliente);

// Definir un objeto OpenAPI mínimo
const swaggerDocument = {
    openapi: '3.0.3',
    info: {
        title: 'API Finatech',
        version: '1.0.0',
        description: 'Documentación de la API con Joi y Swagger'
    },
    paths: {
        '/api/cliente': {
            post: {
                tags: ['Cliente'],
                summary: 'Crear un nuevo cliente',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: clienteSwagger
                        }
                    }
                },
                responses: {
                    200: { description: 'Cliente creado correctamente' },
                    400: { description: 'Error de validación' }
                }
            }
        }
    }
};

// Montar Swagger UI en la ruta /api-docs
router.use('/', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

export default router;