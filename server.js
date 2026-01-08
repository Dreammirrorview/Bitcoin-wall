const express = require('express');
const BitcoinWallet = require('./wallet');
const QRCode = require('qrcode');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Store wallets in memory (in production, use a database)
const wallets = new Map();

// Generate new wallet
app.post('/api/wallet/create', (req, res) => {
  try {
    const wallet = new BitcoinWallet();
    const walletInfo = wallet.generateWallet();
    
    const walletId = Date.now().toString();
    wallets.set(walletId, wallet);
    
    res.json({
      success: true,
      walletId,
      ...walletInfo
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Import existing wallet
app.post('/api/wallet/import', (req, res) => {
  try {
    const { privateKey } = req.body;
    
    if (!privateKey) {
      return res.status(400).json({ success: false, error: 'Private key required' });
    }
    
    const wallet = new BitcoinWallet();
    const walletInfo = wallet.importWallet(privateKey);
    
    const walletId = Date.now().toString();
    wallets.set(walletId, wallet);
    
    res.json({
      success: true,
      walletId,
      ...walletInfo
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get wallet balance
app.get('/api/wallet/:walletId/balance', async (req, res) => {
  try {
    const { walletId } = req.params;
    const wallet = wallets.get(walletId);
    
    if (!wallet) {
      return res.status(404).json({ success: false, error: 'Wallet not found' });
    }
    
    const balance = await wallet.getBalance();
    
    res.json({
      success: true,
      balance,
      address: wallet.address
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get transaction history
app.get('/api/wallet/:walletId/transactions', async (req, res) => {
  try {
    const { walletId } = req.params;
    const wallet = wallets.get(walletId);
    
    if (!wallet) {
      return res.status(404).json({ success: false, error: 'Wallet not found' });
    }
    
    const transactions = await wallet.getTransactionHistory();
    
    res.json({
      success: true,
      transactions
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Send Bitcoin
app.post('/api/wallet/:walletId/send', async (req, res) => {
  try {
    const { walletId } = req.params;
    const { recipientAddress, amount, feeRate } = req.body;
    
    const wallet = wallets.get(walletId);
    
    if (!wallet) {
      return res.status(404).json({ success: false, error: 'Wallet not found' });
    }
    
    if (!recipientAddress || !amount) {
      return res.status(400).json({ 
        success: false, 
        error: 'Recipient address and amount are required' 
      });
    }
    
    if (!wallet.validateAddress(recipientAddress)) {
      return res.status(400).json({ success: false, error: 'Invalid recipient address' });
    }
    
    const result = await wallet.sendBitcoin(recipientAddress, amount, feeRate);
    
    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get QR code for address
app.get('/api/wallet/:walletId/qrcode', async (req, res) => {
  try {
    const { walletId } = req.params;
    const wallet = wallets.get(walletId);
    
    if (!wallet) {
      return res.status(404).json({ success: false, error: 'Wallet not found' });
    }
    
    const qrCode = await QRCode.toDataURL(`bitcoin:${wallet.address}`);
    
    res.json({
      success: true,
      qrCode,
      address: wallet.address
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get transaction status
app.get('/api/transaction/:txid/status', async (req, res) => {
  try {
    const { txid } = req.params;
    
    const wallet = new BitcoinWallet();
    const status = await wallet.getTransactionStatus(txid);
    
    res.json({
      success: true,
      ...status
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Validate address
app.post('/api/address/validate', (req, res) => {
  try {
    const { address } = req.body;
    
    if (!address) {
      return res.status(400).json({ success: false, error: 'Address required' });
    }
    
    const wallet = new BitcoinWallet();
    const isValid = wallet.validateAddress(address);
    
    res.json({
      success: true,
      valid: isValid,
      address
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, status: 'running', timestamp: Date.now() });
});

// Start server
app.listen(PORT, () => {
  console.log(`Bitcoin Wallet Server running on port ${PORT}`);
  console.log(`API available at http://localhost:${PORT}/api`);
  console.log(`Web interface at http://localhost:${PORT}`);
});

module.exports = app;