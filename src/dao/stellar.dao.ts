// import axios from 'axios';
// import * as StellarSdk from 'stellar-sdk';

// const server = new StellarSdk.Horizon.Server('https://horizon-testnet.stellar.org');

// export class StellarDAO {
//   static async getAccountDetails(publicKey: string) {
//     try {
//       const response = await axios.get(
//         `https://horizon-testnet.stellar.org/accounts/${publicKey}`,
//         {
//           headers: {
//             Accept: 'application/json',
//           },
//         }
//       );
//       return response.data;
//     } catch (error: any) {
//       console.error('Error fetching Stellar account:', error.message);
//       throw new Error('Failed to fetch Stellar account details');
//     }
//   }

//   static async sendPayment(
//     senderPublicKey: string,
//     senderSecretKey: string,
//     receiverPublicKey: string,
//     amount: string,
//     memoText: string = 'Payment from Felix'
//   ) {
//     try {
//       const sourceKeypair = StellarSdk.Keypair.fromSecret(senderSecretKey);

//       // Load sender account
//       const sourceAccount = await server.loadAccount(senderPublicKey);

//       // Build transaction
//       const fee = await server.fetchBaseFee();
//       const transaction = new StellarSdk.TransactionBuilder(sourceAccount, {
//         fee: fee.toString(),
//         networkPassphrase: StellarSdk.Networks.TESTNET,
//         memo: StellarSdk.Memo.text(memoText), // ✅ Add memo here
//       })
//         .addOperation(StellarSdk.Operation.payment({
//           destination: receiverPublicKey,
//           asset: StellarSdk.Asset.native(),
//           amount,
//         }))
//         .setTimeout(30)
//         .build();

//       // Sign transaction
//       transaction.sign(sourceKeypair);

//       // Submit transaction
//       const response = await server.submitTransaction(transaction);

//       // Get updated balances
//       const updatedAccount = await server.loadAccount(senderPublicKey);
//       const updatedBalance = updatedAccount.balances.find((b: any) => b.asset_type === 'native')?.balance || '0';

//       return {
//         transactionHash: response.hash,
//         memo: memoText, // Optional return
//         updatedBalance,
//       };
//     } catch (error: any) {
//       console.error('Payment error:', error.response?.data || error.message);
//       throw new Error('Transaction failed');
//     }
//   }
// }




import axios from 'axios';
import * as StellarSdk from 'stellar-sdk';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import config from '../config/env';

const server = new StellarSdk.Horizon.Server('https://horizon-testnet.stellar.org');

export class StellarDAO {
  static async getAccountDetails(publicKey: string) {
    try {
      const response = await axios.get(
        `https://horizon-testnet.stellar.org/accounts/${publicKey}`,
        { headers: { Accept: 'application/json' } }
      );
      return response.data;
    } catch (error: any) {
      console.error('Error fetching Stellar account:', error.message);
      throw new Error('Failed to fetch Stellar account details');
    }
  }

  static async createTrustline(receiverSecretKey: string, assetCode: string, issuerPublicKey: string) {
    try {
      const receiverKeypair = StellarSdk.Keypair.fromSecret(receiverSecretKey);
      const receiverAccount = await server.loadAccount(receiverKeypair.publicKey());
      const asset = new StellarSdk.Asset(assetCode, issuerPublicKey);

      const fee = await server.fetchBaseFee();
      const transaction = new StellarSdk.TransactionBuilder(receiverAccount, {
        fee: fee.toString(),
        networkPassphrase: StellarSdk.Networks.TESTNET,
      })
        .addOperation(StellarSdk.Operation.changeTrust({ asset }))
        .setTimeout(30)
        .build();

      transaction.sign(receiverKeypair);
      const result = await server.submitTransaction(transaction);
      return result.hash;
    } catch (error: any) {
      console.error('Trustline error:', error.response?.data || error.message);
      throw new Error('Failed to create trustline');
    }
  }

  static async sendAssetPayment(
    senderPublicKey: string,
    senderSecretKey: string,
    receiverPublicKey: string,
    amount: string,
    assetCode: string,
    issuerPublicKey: string,
    memoText: string = 'Asset Payment'
  ) {
    try {
      const sourceKeypair = StellarSdk.Keypair.fromSecret(senderSecretKey);
      const sourceAccount = await server.loadAccount(senderPublicKey);
      const asset = new StellarSdk.Asset(assetCode, issuerPublicKey);

      const fee = await server.fetchBaseFee();
      const transaction = new StellarSdk.TransactionBuilder(sourceAccount, {
        fee: fee.toString(),
        networkPassphrase: StellarSdk.Networks.TESTNET,
        memo: StellarSdk.Memo.text(memoText),
      })
        .addOperation(StellarSdk.Operation.payment({
          destination: receiverPublicKey,
          asset,
          amount,
        }))
        .setTimeout(30)
        .build();

      transaction.sign(sourceKeypair);
      const response = await server.submitTransaction(transaction);

      const updatedAccount = await server.loadAccount(senderPublicKey);
      const updatedBalance = updatedAccount.balances.find(
        (b: any) => b.asset_code === assetCode && b.asset_issuer === issuerPublicKey
      )?.balance || '0';

      return {
        transactionHash: response.hash,
        memo: memoText,
        updatedBalance,
      };
    } catch (error: any) {
      console.error('Asset payment error:', error.response?.data || error.message);
      throw new Error('Transaction failed');
    }
  }

  static async getTransactions(accountId: string) {
    try {
      const txs = await server
        .transactions()
        .forAccount(accountId)
        .order('desc')
        .limit(10)
        .call();

      return txs.records.map(tx => ({
        id: tx.id,
        created_at: tx.created_at,
        memo: tx.memo,
        operation_count: tx.operation_count,
        successful: tx.successful,
        source_account: tx.source_account,
        fee_charged: tx.fee_charged,
        hash: tx.hash,
      }));
    } catch (error: any) {
      console.error('Transaction history fetch error:', error.message);
      throw new Error('Unable to fetch transaction history');
    }
  }
}
