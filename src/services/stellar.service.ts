// import { StellarDAO } from '../dao/stellar.dao';

// export class StellarService {
//   static async getAccount(publicKey: string) {
//     return await StellarDAO.getAccountDetails(publicKey);
//   }
//   static async transferXLM(senderPublicKey: string, senderSecretKey: string, receiverPublicKey: string,amount: string) {
//     return await StellarDAO.sendPayment(senderPublicKey, senderSecretKey, receiverPublicKey,amount);
//   }
// }


import { StellarDAO } from '../dao/stellar.dao';
import config from '../config/env';

export class StellarService {
  static async getAccount(publicKey: string) {
    return await StellarDAO.getAccountDetails(publicKey);
  }

  static async transferXLM(
    senderPublicKey: string,
    senderSecretKey: string,
    receiverPublicKey: string,
    amount: string,
    memoText: string = 'Payment from Felix'
  ) {
    return await StellarDAO.sendAssetPayment(
      senderPublicKey,
      senderSecretKey,
      receiverPublicKey,
      amount,
      'XLM',
      '', // no issuer for native XLM
      memoText
    );
  }

  static async transferBLD(
    senderPublicKey: string,
    senderSecretKey: string,
    receiverPublicKey: string,
    amount: string,
    memoText: string = 'BLD Payment'
  ) {
    return await StellarDAO.sendAssetPayment(
      senderPublicKey,
      senderSecretKey,
      receiverPublicKey,
      amount,
      'BLD',
      config.issuerPublicKey,
      memoText
    );
  }

  static async createTrustline(receiverSecretKey: string, assetCode = 'BLD') {
    return await StellarDAO.createTrustline(receiverSecretKey, assetCode, config.issuerPublicKey);
  }
  static async getTransactionHistory(accountId: string) {
    return await StellarDAO.getTransactions(accountId);
  }
}
