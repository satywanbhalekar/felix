import { Router } from 'express';
import { ServiceController } from '../controllers/service.controller';

const router = Router();

// Add a single service to an entity
router.post('/', ServiceController.addService);

// Update service price
router.patch('/update-price', ServiceController.updatePrice);

// Bulk upload services
router.post('/bulk', ServiceController.bulkUpload);

export default router;
