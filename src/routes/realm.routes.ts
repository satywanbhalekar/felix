import { Router } from 'express';
import { createRealm, deleteRealm, getAllRealms } from '../controllers/realm.controller';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { keycloakEnforcer } from '../middlewares/keycloak-enforcer';

const router = Router();

router.post('/', createRealm);
router.get('/realms', getAllRealms);
router.delete('/:realmName', deleteRealm);
export default router;
