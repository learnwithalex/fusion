import { createPublicClient, createWalletClient, http, type Address } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { campnetwork } from './campnetwork';

// Contract address on Basecamp
export const FUSION_MARKETPLACE_ADDRESS = '0xe23d977B550440B8d2803393fE638d81061920c9' as const;

// Protocol wallet (for automated operations)
const PROTOCOL_PRIVATE_KEY = process.env.PROTOCOL_PRIVATE_KEY as `0x${string}`;

// Public client for reading
export const publicClient = createPublicClient({
    chain: campnetwork,
    transport: http()
});

// Wallet client for writing (protocol operations)
let walletClient: any = null;

if (PROTOCOL_PRIVATE_KEY) {
    const account = privateKeyToAccount(PROTOCOL_PRIVATE_KEY);
    walletClient = createWalletClient({
        account,
        chain: campnetwork,
        transport: http()
    });
}

export { walletClient };

// Contract ABI - Essential functions only
export const FUSION_MARKETPLACE_ABI = [
    // Auction functions
    {
        "inputs": [
            { "internalType": "uint256", "name": "assetId", "type": "uint256" },
            { "internalType": "uint256", "name": "tokenId", "type": "uint256" },
            { "internalType": "uint256", "name": "startPrice", "type": "uint256" },
            { "internalType": "uint256", "name": "duration", "type": "uint256" }
        ],
        "name": "createAuction",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [{ "internalType": "uint256", "name": "assetId", "type": "uint256" }],
        "name": "placeBid",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "inputs": [{ "internalType": "uint256", "name": "assetId", "type": "uint256" }],
        "name": "finalizeAuction",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            { "internalType": "uint256", "name": "assetId", "type": "uint256" },
            { "internalType": "address", "name": "bidder", "type": "address" }
        ],
        "name": "refundBidder",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    // Buy functions
    {
        "inputs": [{ "internalType": "address", "name": "creator", "type": "address" }],
        "name": "recordBuyTransaction",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "inputs": [
            { "internalType": "address", "name": "buyer", "type": "address" },
            { "internalType": "address", "name": "creator", "type": "address" },
            { "internalType": "uint256", "name": "amount", "type": "uint256" }
        ],
        "name": "releaseBuyPayment",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    // View functions
    {
        "inputs": [{ "internalType": "uint256", "name": "assetId", "type": "uint256" }],
        "name": "getAuction",
        "outputs": [
            {
                "components": [
                    { "internalType": "address", "name": "creator", "type": "address" },
                    { "internalType": "uint256", "name": "tokenId", "type": "uint256" },
                    { "internalType": "uint256", "name": "startPrice", "type": "uint256" },
                    { "internalType": "uint256", "name": "duration", "type": "uint256" },
                    { "internalType": "uint256", "name": "startedAt", "type": "uint256" },
                    { "internalType": "uint256", "name": "endsAt", "type": "uint256" },
                    { "internalType": "address", "name": "highestBidder", "type": "address" },
                    { "internalType": "uint256", "name": "highestBid", "type": "uint256" },
                    { "internalType": "bool", "name": "active", "type": "bool" },
                    { "internalType": "bool", "name": "completed", "type": "bool" }
                ],
                "internalType": "struct FusionMarketplace.Auction",
                "name": "",
                "type": "tuple"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [{ "internalType": "uint256", "name": "assetId", "type": "uint256" }],
        "name": "getBids",
        "outputs": [
            {
                "components": [
                    { "internalType": "address", "name": "bidder", "type": "address" },
                    { "internalType": "uint256", "name": "amount", "type": "uint256" },
                    { "internalType": "uint256", "name": "timestamp", "type": "uint256" },
                    { "internalType": "bool", "name": "refunded", "type": "bool" }
                ],
                "internalType": "struct FusionMarketplace.Bid[]",
                "name": "",
                "type": "tuple[]"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [{ "internalType": "uint256", "name": "assetId", "type": "uint256" }],
        "name": "hasAuctionEnded",
        "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [{ "internalType": "uint256", "name": "assetId", "type": "uint256" }],
        "name": "getTimeRemaining",
        "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
        "stateMutability": "view",
        "type": "function"
    },
    // Events
    {
        "anonymous": false,
        "inputs": [
            { "indexed": true, "internalType": "uint256", "name": "assetId", "type": "uint256" },
            { "indexed": true, "internalType": "uint256", "name": "tokenId", "type": "uint256" },
            { "indexed": true, "internalType": "address", "name": "creator", "type": "address" },
            { "indexed": false, "internalType": "uint256", "name": "startPrice", "type": "uint256" },
            { "indexed": false, "internalType": "uint256", "name": "duration", "type": "uint256" }
        ],
        "name": "AuctionCreated",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            { "indexed": true, "internalType": "uint256", "name": "assetId", "type": "uint256" },
            { "indexed": true, "internalType": "address", "name": "bidder", "type": "address" },
            { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" },
            { "indexed": false, "internalType": "uint256", "name": "timestamp", "type": "uint256" }
        ],
        "name": "BidPlaced",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            { "indexed": true, "internalType": "uint256", "name": "assetId", "type": "uint256" },
            { "indexed": true, "internalType": "address", "name": "winner", "type": "address" },
            { "indexed": false, "internalType": "uint256", "name": "winningBid", "type": "uint256" }
        ],
        "name": "AuctionFinalized",
        "type": "event"
    }
] as const;
