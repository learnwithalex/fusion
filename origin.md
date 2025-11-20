Origin Methods (auth.origin)
The Origin class provides methods for interacting with Origin IpNFTs, uploading files, managing user stats, and more. You can access these methods via auth.origin after authentication.

Types
LicenseTerms

The license terms object used in minting and updating methods:


Copy
type LicenseTerms = {
  price: bigint; // Price in wei
  duration: number; // Duration in seconds
  royaltyBps: number; // Royalty in basis points (0-10000)
  paymentToken: Address; // Payment token address (address(0) for native currency)
};
File Upload & Minting
mintFile(file: File, metadata: Record<string, unknown>, license: LicenseTerms, parentId?: bigint, options?: { progressCallback?: (percent: number) => void })

Uploads a file and mints an IpNFT for it.

file: The file to upload and mint.

metadata: Additional metadata for the IpNFT.

license: License terms for the IpNFT (price, duration, royalty, payment token).

parentId: Optional parent token ID for derivative works.

options.progressCallback: Optional progress callback.

Returns: The minted token ID as a string, or throws an error on failure.

mintSocial(source: "spotify" | "twitter" | "tiktok", license: LicenseTerms)

Mints an IpNFT for a connected social account.

source: The social platform.

license: License terms for the IpNFT.

Returns: The minted token ID as a string, or throws an error on failure.

IpNFT & Marketplace Methods
The following methods are available for interacting with IpNFTs and the marketplace. All methods mirror the smart contract functions and require appropriate permissions.

Core IP NFT Methods

mintWithSignature(account: string, tokenId: bigint, parentId: bigint, creatorContentHash: string, uri: string, license: LicenseTerms, deadline: bigint, signature: string) - Mint an IpNFT with a signature

registerIpNFT(source: string, deadline: bigint, license: LicenseTerms, metadata: Record<string, unknown>, fileKey?: string, parentId?: bigint) - Register an IpNFT for minting

updateTerms(tokenId: bigint, license: LicenseTerms) - Update license terms for an IpNFT

requestDelete(tokenId: bigint) - Request deletion of an IpNFT

getTerms(tokenId: bigint) - Get license terms for an IpNFT

ownerOf(tokenId: bigint) - Get the owner of an IpNFT

balanceOf(owner: string) - Get the balance of IpNFTs for an owner

contentHash(tokenId: bigint) - Get the content hash of an IpNFT

tokenURI(tokenId: bigint) - Get the metadata URI of an IpNFT

dataStatus(tokenId: bigint) - Get the data status of an IpNFT

royaltyInfo(tokenId: bigint, value: bigint) - Get royalty information

getApproved(tokenId: bigint) - Get the approved address for an IpNFT

isApprovedForAll(owner: string, operator: string) - Check if operator is approved for all tokens

transferFrom(from: string, to: string, tokenId: bigint) - Transfer an IpNFT

safeTransferFrom(from: string, to: string, tokenId: bigint) - Safely transfer an IpNFT

approve(to: string, tokenId: bigint) - Approve an address for a specific IpNFT

setApprovalForAll(operator: string, approved: boolean) - Set approval for all tokens

Marketplace Methods

buyAccess(tokenId: bigint, periods: number, value?: bigint) - Buy access to an IpNFT

renewAccess(tokenId: bigint, periods: number) - Renew access to an IpNFT

hasAccess(tokenId: bigint, user: string) - Check if user has access to an IpNFT

subscriptionExpiry(tokenId: bigint, user: string) - Get subscription expiry for a user

See the SDK source or contract ABI for full parameter details.

buyAccessSmart(tokenId: bigint, periods: number)

Buys access to an asset, handling payment approval if needed.

tokenId: The IpNFT token ID.

periods: Number of periods to buy.

Returns: Result of the buy access transaction.

getData(tokenId: bigint)

Fetches metadata for a given IpNFT.

tokenId: The IpNFT token ID.

Returns: Data object for the token.

User Data & Stats
getOriginUploads()

Fetches the user's Origin file uploads.

Returns: Array of upload data, or null on failure.

getOriginUsage()

Fetches the user's Origin stats (multiplier, points, usage, etc).

Returns: Object with user stats including:

user.multiplier - User's Origin multiplier

user.points - User's Origin points

user.active - Whether user's Origin is active

teams - Array of team data

dataSources - Array of data source information

setOriginConsent(consent: boolean)

Sets the user's consent for Origin usage.

consent: true or false.

Returns: Promise that resolves on success, throws APIError on failure.

Utility Methods
getJwt()

Gets the current JWT token.

Returns: The JWT string.

setViemClient(client: any)

Sets the viem wallet client for blockchain interactions.

client: The viem wallet client instance.

You can call these methods as await auth.origin.methodName(...) after authenticating with the SDK. For more details, see the inline code documentation.