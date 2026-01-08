const bitcoin = require('bitcoinjs-lib');
const axios = require('axios');
const NETWORK = bitcoin.networks.bitcoin;

class BitcoinWallet {
  constructor() {
    this.keyPair = null;
    this.address = null;
    this.balance = 0;
    this.transactions = [];
  }

  generateWallet() {
    // Generate a new key pair
    this.keyPair = bitcoin.ECPair.makeRandom({ network: NETWORK });
    
    // Generate address (P2PKH for compatibility)
    const { address } = bitcoin.payments.p2pkh({
      pubkey: this.keyPair.publicKey,
      network: NETWORK
    });
    
    this.address = address;
    
    return {
      address: this.address,
      privateKey: this.keyPair.toWIF(),
      publicKey: this.keyPair.publicKey.toString('hex')
    };
  }

  importWallet(privateKeyWIF) {
    try {
      this.keyPair = bitcoin.ECPair.fromWIF(privateKeyWIF, NETWORK);
      
      const { address } = bitcoin.payments.p2pkh({
        pubkey: this.keyPair.publicKey,
        network: NETWORK
      });
      
      this.address = address;
      
      return {
        address: this.address,
        privateKey: this.keyPair.toWIF(),
        publicKey: this.keyPair.publicKey.toString('hex')
      };
    } catch (error) {
      throw new Error('Invalid private key');
    }
  }

  async getBalance() {
    if (!this.address) {
      throw new Error('No wallet address available');
    }

    try {
      const response = await axios.get(`https://blockstream.info/api/address/${this.address}`);
      const data = response.data;
      
      this.balance = data.chain_stats.funded_txo_sum - data.chain_stats.spent_txo_sum;
      
      // Convert satoshis to BTC
      return this.balance / 100000000;
    } catch (error) {
      console.error('Error fetching balance:', error.message);
      return 0;
    }
  }

  async getTransactionHistory() {
    if (!this.address) {
      throw new Error('No wallet address available');
    }

    try {
      const response = await axios.get(`https://blockstream.info/api/address/${this.address}/txs`);
      this.transactions = response.data;
      
      return this.transactions.map(tx => ({
        txid: tx.txid,
        amount: this.calculateTxAmount(tx),
        confirmations: tx.status.confirmed ? Math.floor(Date.now() / 1000) - tx.status.block_time : 0,
        timestamp: tx.status.block_time || Math.floor(Date.now() / 1000),
        status: tx.status.confirmed ? 'confirmed' : 'pending'
      }));
    } catch (error) {
      console.error('Error fetching transactions:', error.message);
      return [];
    }
  }

  calculateTxAmount(tx) {
    let incoming = 0;
    let outgoing = 0;
    
    tx.vout.forEach(output => {
      if (output.scriptpubkey_address === this.address) {
        incoming += output.value;
      }
    });
    
    tx.vin.forEach(input => {
      if (input.prevout && input.prevout.scriptpubkey_address === this.address) {
        outgoing += input.prevout.value;
      }
    });
    
    return (incoming - outgoing) / 100000000;
  }

  async sendBitcoin(recipientAddress, amountBTC, feeRate = 10) {
    if (!this.keyPair || !this.address) {
      throw new Error('No wallet loaded');
    }

    try {
      // Convert BTC to satoshis
      const amountSatoshis = Math.floor(amountBTC * 100000000);
      
      // Get UTXOs (unspent transaction outputs)
      const utxosResponse = await axios.get(`https://blockstream.info/api/address/${this.address}/utxo`);
      const utxos = utxosResponse.data;
      
      if (utxos.length === 0) {
        throw new Error('No UTXOs available. You need to receive some Bitcoin first.');
      }
      
      // Calculate total available and fee
      let totalAvailable = 0;
      let selectedUtxos = [];
      
      for (let utxo of utxos) {
        selectedUtxos.push(utxo);
        totalAvailable += utxo.value;
        
        if (totalAvailable >= amountSatoshis + 1000) { // 1000 satoshis minimum fee
          break;
        }
      }
      
      if (totalAvailable < amountSatoshis + 1000) {
        throw new Error('Insufficient balance');
      }
      
      // Get detailed UTXO information
      for (let utxo of selectedUtxos) {
        const txResponse = await axios.get(`https://blockstream.info/api/tx/${utxo.txid}`);
        utxo.tx = txResponse.data;
      }
      
      // Build transaction
      const psbt = new bitcoin.Psbt({ network: NETWORK });
      
      selectedUtxos.forEach(utxo => {
        psbt.addInput({
          hash: utxo.txid,
          index: utxo.vout,
          witnessUtxo: {
            script: Buffer.from(utxo.tx.vout[utxo.vout].scriptpubkey, 'hex'),
            value: utxo.value
          }
        });
      });
      
      // Add output
      psbt.addOutput({
        address: recipientAddress,
        value: amountSatoshis
      });
      
      // Calculate change
      const fee = Math.ceil(psbt.inputCount * 180 * feeRate + psbt.outputCount * 34 * feeRate);
      const change = totalAvailable - amountSatoshis - fee;
      
      if (change > 546) { // Minimum change amount (dust limit)
        psbt.addOutput({
          address: this.address,
          value: change
        });
      }
      
      // Sign transaction
      psbt.signAllInputs(this.keyPair);
      
      // Finalize
      psbt.finalizeAllInputs();
      
      // Extract transaction
      const tx = psbt.extractTransaction();
      const txHex = tx.toHex();
      
      // Broadcast transaction
      const broadcastResponse = await axios.post('https://blockstream.info/api/tx', txHex);
      
      return {
        txid: broadcastResponse.data,
        amount: amountBTC,
        recipient: recipientAddress,
        fee: fee / 100000000,
        status: 'broadcasted'
      };
      
    } catch (error) {
      console.error('Error sending Bitcoin:', error.message);
      throw new Error(`Failed to send Bitcoin: ${error.message}`);
    }
  }

  validateAddress(address) {
    try {
      bitcoin.address.toOutputScript(address, NETWORK);
      return true;
    } catch (error) {
      return false;
    }
  }

  async getTransactionStatus(txid) {
    try {
      const response = await axios.get(`https://blockstream.info/api/tx/${txid}`);
      const tx = response.data;
      
      return {
        txid: tx.txid,
        confirmed: tx.status.confirmed,
        blockHeight: tx.status.block_height,
        blockTime: tx.status.block_time,
        confirmations: tx.status.confirmed ? this.calculateConfirmations(tx.status.block_height) : 0
      };
    } catch (error) {
      throw new Error('Transaction not found');
    }
  }

  calculateConfirmations(blockHeight) {
    // This is approximate. In production, you'd fetch current block height
    const currentHeight = 800000; // Approximate current block height
    return currentHeight - blockHeight;
  }
}

module.exports = BitcoinWallet;