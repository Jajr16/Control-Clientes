import swaggerUi from 'swagger-ui-express';
import j2s from 'joi-to-swagger';
import { createSchemaCliente } from '../modules/cliente/cliente.schema.js';
import { inmuebleResponseSchema, inmuebleSchema } from '../modules/inmueble/inmueble.schema.js';
import express from 'express';

const router = express.Router();

// 1. Conversión de Schemas (Centralizada)
const { swagger: clienteSchemaJS } = j2s(createSchemaCliente);
const { swagger: inmuebleInputSchemaJS } = j2s(inmuebleSchema);
const { swagger: inmuebleOutputSchemaJS } = j2s(inmuebleResponseSchema);

const swaggerDocument = {
    openapi: '3.0.3',
    info: {
        title: 'API Finatech',
        version: '1.0.0',
        description: 'Documentación de la API con Joi y Swagger'
    },
    components: {
        schemas: {
            ClienteInput: clienteSchemaJS,
            InmuebleInput: inmuebleInputSchemaJS,
            InmuebleOutput: inmuebleOutputSchemaJS
        }
    },
    paths: {
        '/api/cliente': {
            post: {
                tags: ['Cliente'],
                summary: 'Crear un nuevo cliente',
                requestBody: {
                    required: true,
                    content: { 'application/json': { schema: { $ref: '#/components/schemas/ClienteInput' } } }
                },
                responses: { 201: { description: 'Creado' }, 400: { description: 'Validación fallida' } }
            }
        },
        '/api/inmueble/': {
            post: {
                tags: ['Inmueble'],
                summary: 'Crear inmueble',
                requestBody: {
                    required: true,
                    content: { 'application/json': { schema: { $ref: '#/components/schemas/InmuebleInput' } } }
                },
                responses: { 201: { description: 'Creado' }, 409: { description: 'Recurso duplicado' }, 500: { description: 'Error interno' } }
            }
        },
        '/api/inmueble/{claveCatastral}': {
            patch: {
                tags: ['Inmueble'],
                summary: 'Actualizar inmueble',
                parameters: [
                    { name: 'claveCatastral', in: 'path', required: true, description: 'Clave única del inmueble', schema: { type: 'string', example: 'CLAVEPRUEBA' } }
                ],
                requestBody: {
                    required: true,
                    content: { 'application/json': { schema: { $ref: '#/components/schemas/InmuebleInput' } } }
                },
                responses: { 200: { description: 'Actualizado' } }
            },
            delete: {
                tags: ['Inmueble'],
                summary: 'Eliminar inmueble',
                parameters: [
                    { name: 'claveCatastral', in: 'path', required: true, description: 'Clave única del inmueble', schema: { type: 'string', example: 'CLAVEPRUEBA'}}
                ],
                responses: { 200: { description: 'Eliminado' }, 404: { description: 'Inmueble no encontrado' }, 500: { description: 'Error interno' } }
            }
        },
        '/api/inmueble/{cif}': {
            get: {
                tags: ['Inmueble'],
                summary: 'Obtener inmuebles por CIF',
                parameters: [
                    { name: 'cif', in: 'path', required: true, description: 'Clave única de empresa', schema: { type: 'string', example: 'A1739593M' } }
                ],
                responses: {
                    200: {
                        description: 'Lista de inmuebles',
                        content: {
                            'application/json': {
                                schema: { 
                                    type: 'array', 
                                    items: { $ref: '#/components/schemas/InmuebleOutput' }
                                }
                            }
                        }
                    },
                    404: { description: 'Empresa no encontrada' }, 500: { description: 'Error interno' }
                }
            }
        }
    }
};

router.use('/', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

export default router;