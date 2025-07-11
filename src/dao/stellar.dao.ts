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
import { supabase } from '../config/db';

const server = new StellarSdk.Horizon.Server('https://horizon-testnet.stellar.org');

export class StellarDAO {

    static async getTransactionsByAccount(publicKey: string) {
        try {
          const payments = await server.payments()
            .forAccount(publicKey)
            .order('desc')
            .limit(20)
            .call();
    
          const txs = [];
    
          for (const record of payments.records) {
            if (record.type !== 'payment') continue;
    
            const txDetails = await record.transaction();
    
            txs.push({
              from: record.from,
              to: record.to,
              asset: record.asset_type === 'native' ? 'XLM' : `${record.asset_code}${record.asset_issuer?.slice(0, 5)}...`,
              amount: record.amount,
              memo: txDetails.memo,
              createdAt: txDetails.created_at,
              txHash: txDetails.hash,
            });
          }
    
          return txs;
        } catch (error: any) {
          console.error('Failed to fetch transactions:', error.message);
          throw new Error('Could not fetch transaction history');
        }
      }

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

      static async addMultisig(userSecretKey: string, issuerPublicKey: string) {
        const keypair = StellarSdk.Keypair.fromSecret(userSecretKey);
        const account = await server.loadAccount(keypair.publicKey());
      
        const transaction = new StellarSdk.TransactionBuilder(account, {
            fee: (await server.fetchBaseFee()).toString(),

          networkPassphrase: StellarSdk.Networks.TESTNET,
        })
          // Add issuer as signer (weight 1)
          .addOperation(
            StellarSdk.Operation.setOptions({
              signer: {
                ed25519PublicKey: issuerPublicKey,
                weight: 1,
              },
            })
          )
          // Set thresholds: low=1, med=2, high=2 (user=1, issuer=1 → both required)
          .addOperation(
            StellarSdk.Operation.setOptions({
              masterWeight: 1,       // user key weight
              lowThreshold: 1,
              medThreshold: 2,
              highThreshold: 2,
            })
          )
          .setTimeout(300)
          .build();
      
        transaction.sign(keypair);
        await server.submitTransaction(transaction);
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
        .addOperation(StellarSdk.Operation.changeTrust({ asset ,limit: '1000000' }))
        .setTimeout(30)
        .build();

      transaction.sign(receiverKeypair);
      const result = await server.submitTransaction(transaction);
      return result.hash;
    } catch (error: any) {
        const resultCodes = error.response?.data?.extras?.result_codes;
        console.error('Trustline error:', resultCodes || error.response?.data || error.message);
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
        if (error.response) {
          console.error('Error submitting transaction to Stellar:', JSON.stringify(error.response.data, null, 2));
        } else {
          console.error('Unexpected error:', error.message);
        }
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
      .setTimeout(300)
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





  static async createMultisigXDR(
    senderPublicKey: string,
    senderSecretKey: string,
    receiverPublicKey: string,
    issuerPublicKey: string,
    amount: string,
    assetCode: string = 'BLD',
    memo: string = 'Multisig transfer'
  ) {
    const senderKeypair = StellarSdk.Keypair.fromSecret(senderSecretKey);
    const sourceAccount = await server.loadAccount(senderPublicKey);
    const asset = new StellarSdk.Asset(assetCode, issuerPublicKey);
    const fee = await server.fetchBaseFee();

    const tx = new StellarSdk.TransactionBuilder(sourceAccount, {
      fee: fee.toString(),
      networkPassphrase: StellarSdk.Networks.TESTNET,
      memo: StellarSdk.Memo.text(memo),
    })
      .addOperation(StellarSdk.Operation.payment({
        destination: receiverPublicKey,
        asset,
        amount,
      }))
      .setTimeout(300)
      .build();

    tx.sign(senderKeypair);
    const xdr = tx.toXDR();

    // Save XDR to DB
    await supabase.from('pending_transactions').insert({
      sender_public_key: senderPublicKey,
      receiver_public_key: receiverPublicKey,
      issuer_public_key: issuerPublicKey,
      amount,
      xdr,
      memo,
      asset_code: assetCode,
    });
console.log("xdrxdrxdr");

    return { xdr };
  }

  static async approveMultisigXDR(xdr: string, issuerSecretKey: string) {
    const tx = new StellarSdk.Transaction(xdr, StellarSdk.Networks.TESTNET);
    const issuerKeypair = StellarSdk.Keypair.fromSecret(issuerSecretKey);
    tx.sign(issuerKeypair);

    const response = await server.submitTransaction(tx);

    // Update status in DB
    await supabase.from('pending_transactions')
      .update({ status: 'COMPLETED' })
      .eq('xdr', xdr);

    return {
      transactionHash: response.hash,
      memo: tx.memo?.value,
    };
  }

  static async getPendingTransactions() {
    const { data, error } = await supabase
      .from('pending_transactions')
      .select('*')
      .eq('status', 'PENDING')
      .order('created_at', { ascending: false });

    if (error) throw new Error('Failed to fetch pending transactions');
    return data;
  }





}
