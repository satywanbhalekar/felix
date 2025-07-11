import { Router } from 'express';
import { EntityController } from '../controllers/entity.controller';

const router = Router();

// Create a new entity (CoE Desk or Project)
router.post('/', EntityController.createEntity);

// Add a user as member to an entity
router.post('/add-member', EntityController.addMember);

// Get all entities owned by a user
router.get('/owner/:ownerId', EntityController.getEntitiesByOwner);

export default router;
