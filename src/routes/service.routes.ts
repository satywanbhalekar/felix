import { Router } from 'express';
import { ServiceController } from '../controllers/service.controller';

const router = Router();

// Add a single service to an entity
router.post('/', ServiceController.addService);

// Update service price
router.patch('/update-price', ServiceController.updatePrice);

// Bulk upload services
router.post('/bulk', ServiceController.bulkUpload);

router.post('/:id/sell', ServiceController.markServiceAsPublic);

router.get('/entity/:entityId', ServiceController.getServicesByEntityId);
router.get('/public', ServiceController.getAllPublicServices);
router.post('/buy', ServiceController.buyPublicService);
export default router;
