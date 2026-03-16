import express from 'express'

import { createAdeudo } from './adeudo.controller.js'
import { validateSchema } from '../../middleware/validateSchema.js'

const router = express.Router();

router.post('/', createAdeudo);

export default router;