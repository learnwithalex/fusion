import { type Chain } from 'viem'

export const campnetwork = {
    id: 123420001114,
    name: 'Basecamp',
    nativeCurrency: { name: 'Camp Network', symbol: 'CAMP', decimals: 18 },
    rpcUrls: {
        default: { http: ['https://rpc.basecamp.t.raas.gelato.cloud'] },
    },
    blockExplorers: {
        default: { name: 'Basecamp', url: 'https://basecamp.cloud.blockscout.com' },
    },
} as const satisfies Chain