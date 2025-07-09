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

    static async createAndFundAccount() {
        try {
          // Create new keypair
          const pair = StellarSdk.Keypair.random();
          const publicKey = pair.publicKey();
          const secretKey = pair.secret();
    
          // Fund account using friendbot (Testnet only)
          await axios.get(`https://friendbot.stellar.org/?addr=${publicKey}`);
    
          return { publicKey, secretKey };
        } catch (error: any) {
          console.error('Account creation/funding failed:', error.message);
          throw new Error('Failed to create and fund account');
        }
      }

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
  static async sendAssetPaymentWithMultisig(
    senderPublicKey: string,
    senderSecretKey: string,
    issuerPublicKey: string,
    issuerSecretKey: string,
    receiverPublicKey: string,
    amount: string,
    assetCode: string,
    memoText: string = 'Asset Payment with multisig'
  ) {
    try {
      const sourceKeypair = StellarSdk.Keypair.fromSecret(senderSecretKey);
      const issuerKeypair = StellarSdk.Keypair.fromSecret(issuerSecretKey);
  
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
  
      // ✅ Sign with both sender and issuer
      transaction.sign(sourceKeypair);
      transaction.sign(issuerKeypair);
  
      const response = await server.submitTransaction(transaction);
  
      const updatedAccount = await server.loadAccount(senderPublicKey);
      const updatedBalance = updatedAccount.balances.find(
        (b: any) => b.asset_code === assetCode && b.asset_issuer === issuerPublicKey
      )?.balance || '0';
  
      return {
        transactionHash: response.hash,
        updatedBalance,
        memo: memoText,
      };
    } catch (error: any) {
      console.error('Multisig asset payment error:', error.response?.data || error.message);
      throw new Error('Multisig Transaction failed');
    }
  }
  

  static async addMultisigToAccount(
    senderSecretKey: string,
    issuerPublicKey: string
  ) {
    try {
      const senderKeypair = StellarSdk.Keypair.fromSecret(senderSecretKey);
      const senderPublicKey = senderKeypair.publicKey();
      const account = await server.loadAccount(senderPublicKey);
      const fee = await server.fetchBaseFee();
  
      const transaction = new StellarSdk.TransactionBuilder(account, {
        fee: fee.toString(),
        networkPassphrase: StellarSdk.Networks.TESTNET,
      })
        .addOperation(StellarSdk.Operation.setOptions({
          masterWeight: 1, // sender weight
          lowThreshold: 1,
          medThreshold: 2,
          highThreshold: 2,
        }))
        .addOperation(StellarSdk.Operation.setOptions({
          signer: {
            ed25519PublicKey: issuerPublicKey,
            weight: 1,
          },
        }))
        .setTimeout(30)
        .build();
  
      transaction.sign(senderKeypair);
  
      const response = await server.submitTransaction(transaction);
      return {
        message: 'Issuer added as signer. Thresholds updated.',
        transactionHash: response.hash,
      };
    } catch (err: any) {
      console.error('Multisig setup failed:', err.response?.data || err.message);
      throw new Error('Failed to set up multisig');
    }
  }
  
  static async createMultisigAssetPaymentXDR(
    senderPublicKey: string,
    senderSecretKey: string,
    receiverPublicKey: string,
    assetCode: string,
    issuerPublicKey: string,
    amount: string,
    memoText = 'Multisig payment request'
  ) {
    const senderKeypair = StellarSdk.Keypair.fromSecret(senderSecretKey);
    const account = await server.loadAccount(senderPublicKey);
    const asset = new StellarSdk.Asset(assetCode, issuerPublicKey);
    const fee = await server.fetchBaseFee();

    const tx = new StellarSdk.TransactionBuilder(account, {
      fee: fee.toString(),
      networkPassphrase: StellarSdk.Networks.TESTNET,
      memo: StellarSdk.Memo.text(memoText),
    })
      .addOperation(
        StellarSdk.Operation.payment({
          destination: receiverPublicKey,
          asset,
          amount,
        })
      )
      .setTimeout(60)
      .build();

    tx.sign(senderKeypair);
    return tx.toXDR(); // Return base64 XDR
  }

  static async signAndSubmitMultisigXDR(xdr: string, issuerSecretKey: string) {
    const tx = new StellarSdk.Transaction(xdr, StellarSdk.Networks.TESTNET);
    const issuerKeypair = StellarSdk.Keypair.fromSecret(issuerSecretKey);
    tx.sign(issuerKeypair);

    const response = await server.submitTransaction(tx);
    return {
      transactionHash: response.hash,
      memo: tx.memo?.value,
    };
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
