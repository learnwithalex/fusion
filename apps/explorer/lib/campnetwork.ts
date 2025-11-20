import { type Chain } from 'viem'

export const campnetwork = {
  id: 123420001114,
  name: 'basecamp',
  nativeCurrency: { name: 'Camp Network', symbol: 'CAMP', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://rpc-campnetwork.xyz'] },
  },
  blockExplorers: {
    default: { name: 'Basecamp', url: 'https://basecamp.cloud.blockscout.com' },
  },
} as const satisfies Chain