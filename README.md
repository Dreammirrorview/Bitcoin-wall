# Real Bitcoin Wallet Application

A legitimate Bitcoin wallet application built with Node.js that allows real Bitcoin transactions on the mainnet.

## ⚠️ IMPORTANT DISCLAIMER

This is a REAL Bitcoin wallet application that interacts with the ACTUAL Bitcoin blockchain. All transactions are REAL and irreversible. Please use with caution and understand that:

1. **Real Transactions**: This wallet sends and receives REAL Bitcoin on the mainnet
2. **Irreversible**: Once a transaction is broadcast, it CANNOT be reversed
3. **No Simulation**: This is NOT a test or demo - it uses the live Bitcoin network
4. **Security Risks**: Never share your private key with anyone
5. **Start Small**: Test with small amounts first

## Features

- ✅ **Real Wallet Generation**: Create new Bitcoin addresses with valid private keys
- ✅ **Wallet Import**: Import existing wallets using private keys (WIF format)
- ✅ **Real Balance Checking**: Check actual Bitcoin balance from the blockchain
- ✅ **Real Transactions**: Send Bitcoin to any valid Bitcoin address
- ✅ **Transaction History**: View complete transaction history
- ✅ **QR Code Generation**: Generate QR codes for easy receiving
- ✅ **Address Validation**: Validate Bitcoin addresses before sending
- ✅ **Transaction Tracking**: Track transaction confirmations on the blockchain

## Requirements

- Node.js 14.x or higher
- npm or yarn

## Installation

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables (optional):
```bash
# .env file
PORT=3000
BLOCKCHAIN_API=https://blockstream.info/api
```

## Usage

### Start the Server

```bash
npm start
```

The server will start on `http://localhost:3000`

### Access the Web Interface

Open your browser and navigate to:
```
http://localhost:3000
```

## API Endpoints

### Wallet Management

#### Create New Wallet
```bash
POST /api/wallet/create
```
Returns: New wallet with address, private key, and public key

#### Import Existing Wallet
```bash
POST /api/wallet/import
Body: { "privateKey": "your-wif-private-key" }
```
Returns: Imported wallet information

#### Get Wallet Balance
```bash
GET /api/wallet/:walletId/balance
```
Returns: Current BTC balance

#### Get Transaction History
```bash
GET /api/wallet/:walletId/transactions
```
Returns: List of all transactions

### Transactions

#### Send Bitcoin
```bash
POST /api/wallet/:walletId/send
Body: {
  "recipientAddress": "bitcoin-address",
  "amount": 0.001,
  "feeRate": 10
}
```
Returns: Transaction ID and details

#### Get Transaction Status
```bash
GET /api/transaction/:txid/status
```
Returns: Transaction confirmation status

### Utilities

#### Get QR Code
```bash
GET /api/wallet/:walletId/qrcode
```
Returns: QR code data URL for wallet address

#### Validate Address
```bash
POST /api/address/validate
Body: { "address": "bitcoin-address" }
```
Returns: Address validation result

## Security Considerations

⚠️ **CRITICAL SECURITY WARNINGS:**

1. **Private Keys**: Never expose or share your private keys
2. **Test First**: Always test with small amounts first
3. **Backup**: Securely backup your private keys
4. **Network**: Use this on a secure network only
5. **Browser**: Clear browser cache after use
6. **Amounts**: Double-check recipient addresses and amounts
7. **Fees**: Bitcoin transactions require network fees
8. **Confirmations**: Wait for confirmations before considering transactions final

## How It Works

### Wallet Generation
- Uses `bitcoinjs-lib` to generate cryptographically secure key pairs
- Creates valid Bitcoin addresses (P2PKH format)
- Generates WIF (Wallet Import Format) private keys

### Balance Checking
- Queries Blockstream API (public Bitcoin explorer)
- Retrieves UTXOs (Unspent Transaction Outputs)
- Calculates actual balance from blockchain data

### Sending Bitcoin
- Selects available UTXOs
- Builds raw Bitcoin transactions
- Signs transactions with private keys
- Broadcasts to Bitcoin network via Blockstream API
- Returns transaction ID for tracking

### Transaction Tracking
- Monitors blockchain for confirmations
- Updates transaction status
- Calculates confirmation count

## Blockchain API

This application uses the Blockstream API:
- **Base URL**: https://blockstream.info/api
- **Network**: Bitcoin Mainnet
- **Reliability**: High uptime, free public API

## Development

### Project Structure
```
.
├── server.js           # Express server and API endpoints
├── wallet.js          # Bitcoin wallet logic
├── public/
│   └── index.html     # Web interface
├── package.json       # Dependencies
└── README.md         # Documentation
```

### Key Technologies
- **Node.js**: Runtime environment
- **Express**: Web server framework
- **bitcoinjs-lib**: Bitcoin library for transaction signing
- **Axios**: HTTP client for API calls
- **QRCode**: QR code generation
- **Blockstream API**: Blockchain data provider

## Limitations

1. **No Wallet Encryption**: Private keys stored in memory only (sessions)
2. **No Multi-signature**: Single private key wallets only
3. **No HD Wallets**: Not hierarchical deterministic wallets
4. **No Persistence**: Wallets reset on server restart
5. **No Offline Mode**: Requires internet connection
6. **No SegWit**: Uses legacy P2PKH addresses only

## Troubleshooting

### "Insufficient balance" error
- Ensure you have enough Bitcoin to cover the transaction amount AND fees
- Minimum transaction amount is 0.00001 BTC
- Fees vary based on network congestion

### "Invalid recipient address" error
- Verify the Bitcoin address format
- Use a valid Bitcoin mainnet address
- Don't use testnet addresses

### Transactions not confirming
- Check the transaction status using the TXID
- Higher fee rates lead to faster confirmations
- Average confirmation time: 10-60 minutes

## Legal and Compliance

⚠️ **IMPORTANT LEGAL NOTICES:**

1. **Your Responsibility**: You are solely responsible for all transactions
2. **Regulatory Compliance**: Ensure compliance with local regulations
3. **Tax Reporting**: You may need to report transactions for tax purposes
4. **No Warranty**: This software is provided "as is" without warranties
5. **AML/KYC**: Be aware of anti-money laundering regulations

## Support and Resources

### Bitcoin Resources
- [Bitcoin.org](https://bitcoin.org/) - Official Bitcoin website
- [Blockchain.com](https://blockchain.com/) - Blockchain explorer
- [Blockstream Explorer](https://blockstream.info/) - Transaction explorer

### Technical Resources
- [bitcoinjs-lib Documentation](https://github.com/bitcoinjs/bitcoinjs-lib)
- [Bitcoin Developer Guide](https://developer.bitcoin.org/devguide/)
- [Blockstream API Docs](https://blockstream.info/api/)

## Contributing

This is an educational project for legitimate Bitcoin transactions. Contributions for security improvements, additional features, or bug fixes are welcome.

## License

MIT License - Use at your own risk

---

## ⚠️ FINAL WARNING

**THIS IS A REAL BITCOIN WALLET**
- All transactions are REAL and irreversible
- You can LOSE real money if you make mistakes
- Test with SMALL amounts first
- Keep your private keys SECURE
- Understand Bitcoin before using

**USE RESPONSIBLY AND AT YOUR OWN RISK**