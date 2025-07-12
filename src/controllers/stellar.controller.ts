import { Request, Response } from 'express';
import { StellarService } from '../services/stellar.service';
import { ServiceDAO } from '../dao/service.dao';
import { EntityDAO } from '../dao/entity.dao';
import { ServiceService } from '../services/service.service';



export class StellarController {
  static async getAccount(req: Request, res: Response) {
    try {
      const { publicKey } = req.params;
      const account = await StellarService.getAccount(publicKey);
      res.status(200).json(account);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
  static async transferXLM(req: Request, res: Response) {
    const { senderPublicKey, senderSecretKey, receiverPublicKey,amount } = req.body;
    console.log("transferXLM");
    if (!senderPublicKey || !senderSecretKey || !receiverPublicKey || !amount) {
       res.status(400).json({ error: 'All input fields are required' });
    }

    try {
      const result = await StellarService.transferXLM(senderPublicKey, senderSecretKey, receiverPublicKey,amount);
       res.status(200).json({
        message: 'Payment successful',
        transactionHash: result.transactionHash,
        updatedBalance: result.updatedBalance,
      });
    } catch (error: any) {
       res.status(500).json({ error: error.message });
    }
  }


static async transferBLD(req: Request, res: Response) {
    const { senderPublicKey, senderSecretKey, receiverPublicKey, amount } = req.body;
  
    if (!senderPublicKey || !senderSecretKey || !receiverPublicKey || !amount) {
       res.status(400).json({ error: 'All fields are required' });
    }
  console.log("transferBLD");
  
    try {
      const result = await StellarService.transferBLD(
        senderPublicKey, senderSecretKey, receiverPublicKey, amount
      );
      res.status(200).json({ message: 'BLD sent', ...result });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
  
  static async transferBLDWithMultisig(req: Request, res: Response) {
    const {
      senderPublicKey,
      senderSecretKey,
      receiverPublicKey,
      issuerPublicKey,
      issuerSecretKey,
      amount,
      memoText  // ✅ new
    } = req.body;
  
    if (!senderPublicKey || !senderSecretKey || !receiverPublicKey || !issuerPublicKey || !issuerSecretKey || !amount) {
       res.status(400).json({ error: 'All input fields are required' });
    }
  
    try {
      const result = await StellarService.transferBLDWithMultisig(
        senderPublicKey,
        senderSecretKey,
        issuerPublicKey,
        issuerSecretKey,
        receiverPublicKey,
        amount, memoText // ✅ pass to service
      );
      res.status(200).json({
        message: 'BLD Transfer with multisig successful',
        transactionHash: result.transactionHash,
        updatedBalance: result.updatedBalance,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
  

  static async setupMultisig(req: Request, res: Response) {
    const { senderSecretKey, issuerPublicKey } = req.body;
    if (!senderSecretKey || !issuerPublicKey) {
       res.status(400).json({ error: 'Both senderSecretKey and issuerPublicKey are required' });
    }
  
    try {
      const result = await StellarService.configureMultisig(senderSecretKey, issuerPublicKey);
      res.status(200).json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
  
  
  static async prepareMultisigPayment(req: Request, res: Response) {
    const {
      senderPublicKey,
      senderSecretKey,
      receiverPublicKey,
      issuerPublicKey,
      amount,
      assetCode,
    } = req.body;

    if (
      !senderPublicKey ||
      !senderSecretKey ||
      !receiverPublicKey ||
      !issuerPublicKey ||
      !amount ||
      !assetCode
    ) {
       res.status(400).json({ error: 'All fields required' });
    }

    try {
      const xdr = await StellarService.prepareMultisigPayment(
        senderPublicKey,
        senderSecretKey,
        receiverPublicKey,
        assetCode,
        issuerPublicKey,
        amount
      );
      res.status(200).json({ xdr });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  static async approveMultisigPayment(req: Request, res: Response) {
    const { xdr, issuerSecretKey } = req.body;

    if (!xdr || !issuerSecretKey) {
       res.status(400).json({ error: 'XDR and issuerSecretKey required' });
    }

    try {
      const result = await StellarService.approveMultisigXDR(xdr, issuerSecretKey);
      res.status(200).json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }


  static async createTrustline(req: Request, res: Response) {
    const { receiverSecretKey } = req.body;
    if (!receiverSecretKey)  res.status(400).json({ error: 'receiverSecretKey is required' });
  
    try {
      const txHash = await StellarService.createTrustline(receiverSecretKey);
      res.status(200).json({ message: 'Trustline created', txHash });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
  static async getTransactionHistory(req: Request, res: Response) {
    const { accountId } = req.params;
console.log("getTransactionHistory");

    if (!accountId) {
       res.status(400).json({ error: 'Account ID is required' });
    }

    try {
      const history = await StellarService.getTransactionHistory(accountId);
      res.status(200).json({ transactions: history });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async createAccountWithTrustline(req: Request, res: Response) {
    const { username } = req.body;

    if (!username) {
       res.status(400).json({ error: 'Username is required' });
    }

    try {
      const result = await StellarService.createAccountWithTrustline(username);
      res.status(200).json({
        message: 'Account created, funded, trustline set, and stored in DB',
        ...result,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getTransactions(req: Request, res: Response) {
    const { publicKey } = req.params;

    if (!publicKey) {
       res.status(400).json({ error: 'publicKey is required' });
    }

    try {
      const transactions = await StellarService.getTransactionsForAccount(publicKey);
      res.status(200).json({ count: transactions.length, transactions });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }





  static async initiateMultisigTransfer(req: Request, res: Response) {
    const {
      senderPublicKey,
      senderSecretKey,
      receiverPublicKey,
      issuerPublicKey,
      amount,
      memoText
    } = req.body;

    if (!senderPublicKey || !senderSecretKey || !receiverPublicKey || !issuerPublicKey || !amount) {
       res.status(400).json({ error: 'Missing required fields' });
    }

    try {
      const result = await StellarService.initiateMultisigTransfer(
        senderPublicKey,
        senderSecretKey,
        receiverPublicKey,
        issuerPublicKey,
        amount,
        memoText || 'Multisig transfer'
      );
      res.status(200).json({ message: 'Multisig XDR created and stored', ...result });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async approveMultisigTransfer(req: Request, res: Response) {
    const { xdr, issuerSecretKey } = req.body;

    if (!xdr || !issuerSecretKey) {
       res.status(400).json({ error: 'XDR and issuerSecretKey are required' });
    }

    try {
      const result = await StellarService.approveMultisigTransfer(xdr, issuerSecretKey);
      // ✅ Auto-clone service if memo matches expected pattern
      const memo = result.memo?.toString?.();
      console.log("memo",memo);
      
      const match = memo?.match(/^svc:([a-z0-9]{4})-([a-z0-9]{4})$/i);
      

    if (match) {
      const servicePrefix = match[1];
      const entityPrefix = match[2];
console.log("servicePrefix",servicePrefix,entityPrefix);

      // Look up full serviceId and buyerEntityId using prefixes
      const fullService = await ServiceDAO.findPublicServiceByPrefix(servicePrefix);
      const fullEntity = await EntityDAO.findEntityByPrefix(entityPrefix);
console.log("fullServicefullEntity",fullService,fullEntity);

      if (fullService && fullEntity) {
        await ServiceService.cloneServiceToEntity(fullService.id, fullEntity.id);
      }
    }
      res.status(200).json({ message: 'Transaction approved and submitted', ...result });
    }  catch (error: any) {
        if (error.response) {
          console.error('Error submitting transaction to Stellar:', JSON.stringify(error.response.data, null, 2));
        } else {
          console.error('Unexpected error:', error.message);
        }
        throw new Error('Multisig Transaction failed');
      }
      
  }

  static async listPendingTransfers(req: Request, res: Response) {
    try {
      const data = await StellarService.listPendingTransfers();
      res.status(200).json({ count: data.length, transactions: data });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
  static async listAllUsers(req: Request, res: Response) {
    try {
      const users = await StellarService.getAllUsers();
  
      if (users) {
        res.status(200).json(users);
      } else {
        res.status(500).json({ error: 'Failed to fetch users' });
      }
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
  
  
}
