import { createConfig, http } from 'wagmi';
import { defineChain } from 'viem';
import { injected, metaMask } from 'wagmi/connectors';

// Rootstock Testnet
const rootstockTestnet = defineChain({
  id: 31,
  name: 'Rootstock Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Rootstock Bitcoin',
    symbol: 'RBTC',
  },
  rpcUrls: {
    default: {
      http: [process.env.NEXT_PUBLIC_RPC_URL || 'https://public-node.testnet.rsk.co'],
    },
  },
  blockExplorers: {
    default: {
      name: 'RSK Explorer',
      url: 'https://explorer.testnet.rsk.co',
    },
  },
});

export const wagmiConfig = createConfig({
  chains: [rootstockTestnet],
  connectors: [
    injected(),
    metaMask(),
  ],
  transports: {
    [rootstockTestnet.id]: http(process.env.NEXT_PUBLIC_RPC_URL),
  },
});

