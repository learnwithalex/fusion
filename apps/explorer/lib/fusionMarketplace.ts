// FusionMarketplace contract constants for frontend
export const FUSION_MARKETPLACE_ADDRESS = '0x00329CEBD0B06690aA5a28982CD614185AEA6033' as const;

// Minimal ABI for frontend interactions
export const FUSION_MARKETPLACE_ABI = [
    {
        inputs: [
            { internalType: "uint256", name: "assetId", type: "uint256" },
            { internalType: "uint256", name: "tokenId", "type": "uint256" },
            { internalType: "uint256", name: "startPrice", "type": "uint256" },
            { internalType: "uint256", name: "duration", "type": "uint256" }
        ],
        name: "createAuction",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function"
    },
    {
        inputs: [{ internalType: "uint256", name: "assetId", type: "uint256" }],
        name: "placeBid",
        outputs: [],
        stateMutability: "payable",
        type: "function"
    },
    {
        inputs: [
            { internalType: "uint256", name: "assetId", type: "uint256" },
            { internalType: "address", name: "bidder", type: "address" }
        ],
        name: "refundBidder",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function"
    },
    {
        inputs: [{ internalType: "uint256", name: "assetId", type: "uint256" }],
        name: "finalizeAuction",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function"
    }
] as const;
