import { Router } from 'express';
import { StellarController } from '../controllers/stellar.controller';

const router = Router();

router.get('/account/:publicKey', StellarController.getAccount);
router.post('/transfer', StellarController.transferXLM);
router.post('/transfer-bld', StellarController.transferBLD);
router.post('/trustline', StellarController.createTrustline);
router.get('/:accountId', StellarController.getTransactionHistory);
router.post('/create-account', StellarController.createAccountWithTrustline);
router.post('/setup-multisig', StellarController.setupMultisig);
router.post('/transfer-bld-multisig', StellarController.transferBLDWithMultisig);
router.post('/prepare-multisig-transfer', StellarController.prepareMultisigPayment);
router.post('/approve-multisig-transfer', StellarController.approveMultisigPayment);
router.get('/transactions/:publicKey', StellarController.getTransactions);

router.post('/multisig/initiate', StellarController.initiateMultisigTransfer);
router.post('/multisig/approve', StellarController.approveMultisigTransfer);
router.get('/multisig/pending', StellarController.listPendingTransfers);
router.get('/users/listAllUsers', StellarController.listAllUsers);


export default router;
