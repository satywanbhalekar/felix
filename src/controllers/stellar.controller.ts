import { Request, Response } from 'express';
import { StellarService } from '../services/stellar.service';

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
}
