import express from 'express';
import { getAllTenantTemplates } from '../controllers/tenantTemplate.controller';

const router = express.Router();

router.get('/', getAllTenantTemplates);

export default router;
