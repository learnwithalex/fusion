# Fusion Marketplace Smart Contract

## Overview
This smart contract handles escrow, auctions, and buy transactions for the Fusion IP marketplace, integrating with Origin Protocol IpNFTs.

## Features

### 1. Auction Management
- **Create Auction**: Creators can list assets for auction with a starting price and duration
- **Place Bids**: Users bid with CAMP tokens held in escrow
- **Automatic Finalization**: Anyone can finalize an auction after it ends
- **NFT Transfer**: Winner receives the NFT automatically
- **Payment to Creator**: Winning bid is sent to creator
- **Refunds**: Outbid users can claim refunds

### 2. Buy Transaction Escrow
- **Record Purchases**: Buy transactions are held in escrow
- **Verification**: Backend verifies on-chain before releasing funds
- **Release Payment**: Verified payments are released to creators

### 3. Security Features
- **ReentrancyGuard**: Protection against reentrancy attacks
- **Access Control**: Owner-only functions for admin operations
- **Escrow System**: Funds held securely until conditions are met

## Deployment

### Prerequisites
```bash
cd contracts
npm install
```

### Configuration
1. Set your private key in `.env`:
```
PRIVATE_KEY=your_private_key_here
```

2. Update `scripts/deploy.js` with the Origin IpNFT contract address

### Deploy to Basecamp
```bash
npx hardhat run scripts/deploy.js --network basecamp
```

### After Deployment
1. Save the contract address
2. Export the ABI from `artifacts/contracts/FusionMarketplace.sol/FusionMarketplace.json`
3. Update backend with contract address and ABI
4. Transfer ownership to protocol address: `0xa257a6ecbb64f869c97a8239007f86d2cc676fee`

## Contract Functions

### Auction Functions
- `createAuction(assetId, tokenId, startPrice, duration)` - Create new auction
- `placeBid(assetId)` - Place a bid (payable)
- `finalizeAuction(assetId)` - Finalize auction and transfer NFT
- `refundBidder(assetId, bidder)` - Refund outbid user

### Buy Functions
- `recordBuyTransaction(creator)` - Record buy transaction (payable)
- `releaseBuyPayment(buyer, creator, amount)` - Release payment (owner only)

### View Functions
- `getAuction(assetId)` - Get auction details
- `getBids(assetId)` - Get all bids
- `hasAuctionEnded(assetId)` - Check if auction ended
- `getTimeRemaining(assetId)` - Get time remaining

## Integration with Backend

### 1. Auction Creation
```typescript
// Frontend: User enables bidding
// Backend: Store auction details
// Frontend: Call contract.createAuction(assetId, tokenId, startPrice, duration)
// Frontend: Approve contract to transfer NFT
```

### 2. Placing Bids
```typescript
// Frontend: User places bid
// Frontend: Call contract.placeBid(assetId, { value: bidAmount })
// Backend: Listen for BidPlaced event
// Backend: Update database with bid
```

### 3. Finalizing Auction
```typescript
// Cron Job: Check if auction ended
// Backend: Call contract.finalizeAuction(assetId)
// Backend: Listen for AuctionFinalized event
// Backend: Update database
```

### 4. Buy Transactions
```typescript
// Frontend: User buys access
// Frontend: Call contract.recordBuyTransaction(creator, { value: amount })
// Backend: Verify transaction on-chain
// Backend: Call contract.releaseBuyPayment(buyer, creator, amount)
```

## Events
- `AuctionCreated` - New auction created
- `BidPlaced` - New bid placed
- `AuctionFinalized` - Auction completed
- `BidRefunded` - Bid refunded
- `BuyTransactionRecorded` - Buy transaction recorded
- `FundsWithdrawn` - Funds withdrawn

## Security Considerations
1. Always approve the contract before creating an auction
2. Bids are final and held in escrow
3. Only the contract owner can release buy payments
4. Emergency withdraw available for owner only

## License
MIT
