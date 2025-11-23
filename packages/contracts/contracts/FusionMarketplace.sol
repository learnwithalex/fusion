// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title FusionMarketplace
 * @notice Handles escrow, buy transactions, and auction bidding for Fusion IP assets
 * @dev Integrates with Origin Protocol IpNFTs
 */
contract FusionMarketplace is ReentrancyGuard, Ownable {
    
    // ============ State Variables ============
    
    IERC721 public immutable ipNFT; // Origin Protocol IpNFT contract
    
    struct Auction {
        address creator;
        uint256 tokenId;
        uint256 startPrice;
        uint256 duration; // Duration in seconds after first bid
        uint256 startedAt;
        uint256 endsAt;
        address highestBidder;
        uint256 highestBid;
        bool active;
        bool completed;
    }
    
    struct Bid {
        address bidder;
        uint256 amount;
        uint256 timestamp;
        bool refunded;
    }
    
    // Mapping: assetId => Auction
    mapping(uint256 => Auction) public auctions;
    
    // Mapping: assetId => Bid[]
    mapping(uint256 => Bid[]) public bids;
    
    // Mapping: assetId => bidder => total amount in escrow
    mapping(uint256 => mapping(address => uint256)) public escrow;
    
    // Mapping: buyer => creator => amount (for buy transactions)
    mapping(address => mapping(address => uint256)) public buyEscrow;
    
    // ============ Events ============
    
    event AuctionCreated(
        uint256 indexed assetId,
        uint256 indexed tokenId,
        address indexed creator,
        uint256 startPrice,
        uint256 duration
    );
    
    event BidPlaced(
        uint256 indexed assetId,
        address indexed bidder,
        uint256 amount,
        uint256 timestamp
    );
    
    event AuctionFinalized(
        uint256 indexed assetId,
        address indexed winner,
        uint256 winningBid
    );
    
    event BidRefunded(
        uint256 indexed assetId,
        address indexed bidder,
        uint256 amount
    );
    
    event BuyTransactionRecorded(
        address indexed buyer,
        address indexed creator,
        uint256 amount
    );
    
    event FundsWithdrawn(
        address indexed recipient,
        uint256 amount
    );
    
    // ============ Errors ============
    
    error AuctionNotActive();
    error AuctionAlreadyExists();
    error BidTooLow();
    error AuctionNotEnded();
    error AuctionAlreadyCompleted();
    error NotCreator();
    error NotApproved();
    error NoFundsToWithdraw();
    error TransferFailed();
    
    // ============ Constructor ============
    
    constructor(address _ipNFT) Ownable(msg.sender) {
        ipNFT = IERC721(_ipNFT);
    }
    
    // ============ Auction Functions ============
    
    /**
     * @notice Create a new auction for an asset
     * @param assetId Database ID of the asset
     * @param tokenId Origin Protocol token ID
     * @param startPrice Minimum starting bid in wei
     * @param duration Duration in seconds after first bid
     */
    function createAuction(
        uint256 assetId,
        uint256 tokenId,
        uint256 startPrice,
        uint256 duration
    ) external {
        if (auctions[assetId].active) revert AuctionAlreadyExists();
        
        // Verify caller owns the NFT or is approved
        address owner = ipNFT.ownerOf(tokenId);
        if (owner != msg.sender && !ipNFT.isApprovedForAll(owner, address(this))) {
            revert NotApproved();
        }
        
        auctions[assetId] = Auction({
            creator: msg.sender,
            tokenId: tokenId,
            startPrice: startPrice,
            duration: duration,
            startedAt: 0,
            endsAt: 0,
            highestBidder: address(0),
            highestBid: 0,
            active: true,
            completed: false
        });
        
        emit AuctionCreated(assetId, tokenId, msg.sender, startPrice, duration);
    }
    
    /**
     * @notice Place a bid on an active auction
     * @param assetId Database ID of the asset
     */
    function placeBid(uint256 assetId) external payable nonReentrant {
        Auction storage auction = auctions[assetId];
        
        if (!auction.active) revert AuctionNotActive();
        if (auction.completed) revert AuctionAlreadyCompleted();
        
        // Check if auction has ended
        if (auction.startedAt > 0 && block.timestamp >= auction.endsAt) {
            revert AuctionNotActive();
        }
        
        // Calculate required bid amount
        uint256 requiredBid = auction.highestBid > 0 
            ? auction.highestBid + 1 // Must be at least 1 wei higher
            : auction.startPrice;
        
        if (msg.value < requiredBid) revert BidTooLow();
        
        // If first bid, start the auction timer
        if (auction.startedAt == 0) {
            auction.startedAt = block.timestamp;
            auction.endsAt = block.timestamp + auction.duration;
        }
        
        // Store bid
        bids[assetId].push(Bid({
            bidder: msg.sender,
            amount: msg.value,
            timestamp: block.timestamp,
            refunded: false
        }));
        
        // Update escrow
        escrow[assetId][msg.sender] += msg.value;
        
        // Update highest bid
        auction.highestBidder = msg.sender;
        auction.highestBid = msg.value;
        
        emit BidPlaced(assetId, msg.sender, msg.value, block.timestamp);
    }
    
    /**
     * @notice Finalize auction and transfer NFT to winner
     * @param assetId Database ID of the asset
     */
    function finalizeAuction(uint256 assetId) external nonReentrant {
        Auction storage auction = auctions[assetId];
        
        if (!auction.active) revert AuctionNotActive();
        if (auction.completed) revert AuctionAlreadyCompleted();
        if (block.timestamp < auction.endsAt) revert AuctionNotEnded();
        
        auction.active = false;
        auction.completed = true;
        
        if (auction.highestBidder != address(0)) {
            // Transfer NFT to winner
            ipNFT.safeTransferFrom(
                auction.creator,
                auction.highestBidder,
                auction.tokenId
            );
            
            // Transfer winning bid to creator
            uint256 winningBid = auction.highestBid;
            escrow[assetId][auction.highestBidder] -= winningBid;
            
            (bool success, ) = auction.creator.call{value: winningBid}("");
            if (!success) revert TransferFailed();
            
            emit AuctionFinalized(assetId, auction.highestBidder, winningBid);
        }
    }
    
    /**
     * @notice Refund a bidder who was outbid
     * @param assetId Database ID of the asset
     * @param bidder Address of the bidder to refund
     */
    function refundBidder(uint256 assetId, address bidder) external nonReentrant {
        Auction storage auction = auctions[assetId];
        
        // Can only refund if:
        // 1. Auction is completed and bidder is not the winner, OR
        // 2. Bidder is not the current highest bidder
        if (auction.completed) {
            if (bidder == auction.highestBidder) revert();
        } else {
            if (bidder == auction.highestBidder) revert();
        }
        
        uint256 refundAmount = escrow[assetId][bidder];
        if (refundAmount == 0) revert NoFundsToWithdraw();
        
        escrow[assetId][bidder] = 0;
        
        (bool success, ) = bidder.call{value: refundAmount}("");
        if (!success) revert TransferFailed();
        
        emit BidRefunded(assetId, bidder, refundAmount);
    }
    
    // ============ Buy Transaction Functions ============
    
    /**
     * @notice Record a buy transaction (payment held in escrow)
     * @param creator Address of the asset creator
     */
    function recordBuyTransaction(address creator) external payable nonReentrant {
        buyEscrow[msg.sender][creator] += msg.value;
        emit BuyTransactionRecorded(msg.sender, creator, msg.value);
    }
    
    /**
     * @notice Release buy payment to creator (called by backend after verification)
     * @param buyer Address of the buyer
     * @param creator Address of the creator
     * @param amount Amount to release
     */
    function releaseBuyPayment(
        address buyer,
        address creator,
        uint256 amount
    ) external onlyOwner nonReentrant {
        if (buyEscrow[buyer][creator] < amount) revert NoFundsToWithdraw();
        
        buyEscrow[buyer][creator] -= amount;
        
        (bool success, ) = creator.call{value: amount}("");
        if (!success) revert TransferFailed();
        
        emit FundsWithdrawn(creator, amount);
    }
    
    // ============ View Functions ============
    
    /**
     * @notice Get auction details
     * @param assetId Database ID of the asset
     */
    function getAuction(uint256 assetId) external view returns (Auction memory) {
        return auctions[assetId];
    }
    
    /**
     * @notice Get all bids for an asset
     * @param assetId Database ID of the asset
     */
    function getBids(uint256 assetId) external view returns (Bid[] memory) {
        return bids[assetId];
    }
    
    /**
     * @notice Get bid count for an asset
     * @param assetId Database ID of the asset
     */
    function getBidCount(uint256 assetId) external view returns (uint256) {
        return bids[assetId].length;
    }
    
    /**
     * @notice Check if auction has ended
     * @param assetId Database ID of the asset
     */
    function hasAuctionEnded(uint256 assetId) external view returns (bool) {
        Auction memory auction = auctions[assetId];
        if (!auction.active || auction.startedAt == 0) return false;
        return block.timestamp >= auction.endsAt;
    }
    
    /**
     * @notice Get time remaining in auction
     * @param assetId Database ID of the asset
     */
    function getTimeRemaining(uint256 assetId) external view returns (uint256) {
        Auction memory auction = auctions[assetId];
        if (!auction.active || auction.startedAt == 0) return 0;
        if (block.timestamp >= auction.endsAt) return 0;
        return auction.endsAt - block.timestamp;
    }
    
    // ============ Admin Functions ============
    
    /**
     * @notice Emergency withdraw (only owner)
     */
    function emergencyWithdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        if (balance == 0) revert NoFundsToWithdraw();
        
        (bool success, ) = owner().call{value: balance}("");
        if (!success) revert TransferFailed();
        
        emit FundsWithdrawn(owner(), balance);
    }
    
    /**
     * @notice Receive function to accept ETH
     */
    receive() external payable {}
}
