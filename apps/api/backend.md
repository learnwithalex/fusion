The backend should use drizzle as an orm and postgres as a database.

these are the schema examples:


Users:
id
walletAddress
nonce
name?
bio?
website?
twitter?
spotify?
youtube?
tiktok?
instagram?
profileImage?
headerImage?
createdAt
updatedAt

Follow:
id
userId
followedId
createdAt
updatedAt

Sessions:
id
userId
token
isValid
createdAt
updatedAt


Assets:
id
userId
name
description
thumbnail
video?
tags
type
licenseId
isRemixed
remixOf
creationStatus (draft, live)
assetStatus (buy now, auction, remixOnly)
tokenId?
createdAt
updatedAt


AssetFiles:
id
assetId
file (encrypted url string, decrypted by the user)
createdAt
updatedAt

AssetMetadata:
id
assetFileId
fileType
size
contentHash
mimeType
createdAt
updatedAt

Licenses:
id
userId
price
royalty
royaltyDuration
createdAt
updatedAt


Transactions:
id
userId
assetId
transactionType (minted, remixed, sold, bought)
amount (supports decimal)
tnxhash
status (pending, success, failed)
createdAt
updatedAt


Auth:
To verify user ownership without just passing an address, we should implement a Challenge-Response mechanism (SIWE style):

1. **Nonce Generation**:
   - Endpoint: `POST /auth/nonce`
   - Body: `{ walletAddress: string }`
   - Action: Generate a random nonce, store it with the address (e.g., in Redis or DB) with an expiration.
   - Response: `{ nonce: string }`

2. **Sign Message**:
   - Frontend uses `useViem` hook to get `walletClient`.
   - `walletClient.signMessage({ message: nonce })`

3. **Verify & Login**:
   - Endpoint: `POST /auth/verify`
   - Body: `{ walletAddress: string, signature: string, nonce: string }`
   - Action: 
     - Verify nonce exists for address and hasn't expired.
     - Verify signature matches the address and nonce.
     - If valid, create/update User and Session.
   - Response: `{ token: string, user: User }`


Routes:

Assets:
- `GET /assets`: 
  - Query Params: `search`, `type` (comma-separated), `minPrice`, `maxPrice`, `minRoyalty`, `maxRoyalty`, `status` (buyNow, auction, new), `sort` (trending, recent)
- `POST /assets`: Create new asset
- `GET /assets/:id`: Get details
- `POST /assets/:id/buy`: Buy license
- `POST /assets/:id/remix`: Create derivative

Users:
- `GET /users/:walletAddress`: Get public profile
- `PATCH /users/me`: Update own profile
- `POST /users/:id/follow`: Follow user
- `DELETE /users/:id/follow`: Unfollow user
- `GET /users/:id/assets/created`: Get uploads
- `GET /users/:id/assets/licensed`: Get licensed items
- `GET /users/:id/activity`: Get activity feed