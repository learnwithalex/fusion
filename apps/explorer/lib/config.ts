import { createConfig, http } from 'wagmi'
import { campnetwork } from './campnetwork'

export const config = createConfig({
  chains: [campnetwork],
  transports: {
    [campnetwork.id]: http(),
  },
})