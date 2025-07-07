import { Router } from 'express';
import {
  createUser,
  getUsers,
  updateUser,
  deleteUser,
} from '../controllers/user.controller';
import { keycloakEnforcer } from '../middlewares/keycloak-enforcer';

const router = Router();

router.post('/:realm', createUser);
router.get('/:realm', getUsers);
router.put('/:realm/:userId', updateUser);
router.delete('/:realm/:userId', keycloakEnforcer(`delete-user`), deleteUser);

export default router;
