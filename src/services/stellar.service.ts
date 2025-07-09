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
import { UserDAO } from '../dao/user.dao';

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
  static async transferBLDWithMultisig(
    senderPublicKey: string,
    senderSecretKey: string,
    issuerPublicKey: string,
    issuerSecretKey: string,
    receiverPublicKey: string,
    amount: string
  ) {
    return await StellarDAO.sendAssetPaymentWithMultisig(
      senderPublicKey,
      senderSecretKey,
      issuerPublicKey,
      issuerSecretKey,
      receiverPublicKey,
      amount,
      'BLD'
    );
  }
  
  static async configureMultisig(senderSecretKey: string, issuerPublicKey: string) {
    return await StellarDAO.addMultisigToAccount(senderSecretKey, issuerPublicKey);
  }
  
  static async prepareMultisigPayment(
    senderPublicKey: string,
    senderSecretKey: string,
    receiverPublicKey: string,
    assetCode: string,
    issuerPublicKey: string,
    amount: string
  ) {
    return await StellarDAO.createMultisigAssetPaymentXDR(
      senderPublicKey,
      senderSecretKey,
      receiverPublicKey,
      assetCode,
      issuerPublicKey,
      amount
    );
  }

  static async approveMultisigXDR(xdr: string, issuerSecretKey: string) {
    return await StellarDAO.signAndSubmitMultisigXDR(xdr, issuerSecretKey);
  }

  
  static async createTrustline(receiverSecretKey: string, assetCode = 'BLD') {
    return await StellarDAO.createTrustline(receiverSecretKey, assetCode, config.issuerPublicKey);
  }
  static async getTransactionHistory(accountId: string) {
    return await StellarDAO.getTransactions(accountId);
  }

  static async createAccountWithTrustline(username: string) {
    const { publicKey, secretKey } = await StellarDAO.createAndFundAccount();

    const assetCode = process.env.ASSET_CODE || 'BLD';
    const issuerPublicKey = process.env.ISSUER_PUBLIC_KEY!;

    await StellarDAO.createTrustline(secretKey, assetCode, issuerPublicKey);

    // ✅ Save to Supabase
    await UserDAO.saveUser(username, publicKey, secretKey);

    return { publicKey, secretKey, username };
  }
}
