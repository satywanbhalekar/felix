import { Router } from 'express';
import { StellarController } from '../controllers/stellar.controller';

const router = Router();

router.get('/account/:publicKey', StellarController.getAccount);
router.post('/transfer', StellarController.transferXLM);
router.post('/transfer-bld', StellarController.transferBLD);
router.post('/trustline', StellarController.createTrustline);
router.get('/:accountId', StellarController.getTransactionHistory);

export default router;
