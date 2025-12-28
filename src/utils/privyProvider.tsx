'use client'

import { PrivyProvider } from '@privy-io/react-auth';

export default function Provider({ children }: { children: React.ReactNode }) {
  console.log('🔧 Privy Provider initializing with Mantle Sepolia (Chain ID 5003)');

  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID!}
      clientId={process.env.NEXT_PUBLIC_PRIVY_CLIENT_ID!}
      config={{
        defaultChain: {
          id: 5003,
          name: 'Mantle Sepolia',
          network: 'mantle-sepolia',
          nativeCurrency: {
            name: 'MNT',
            symbol: 'MNT',
            decimals: 18,
          },
          rpcUrls: {
            default: {
              http: ['https://rpc.sepolia.mantle.xyz'],
            },
            public: {
              http: ['https://rpc.sepolia.mantle.xyz'],
            },
          },
          blockExplorers: {
            default: {
              name: 'Mantle Sepolia Explorer',
              url: 'https://sepolia.mantlescan.xyz',
            },
          },
          testnet: true,
        },
        supportedChains: [
          {
            id: 5003,
            name: 'Mantle Sepolia',
            network: 'mantle-sepolia',
            nativeCurrency: {
              name: 'MNT',
              symbol: 'MNT',
              decimals: 18,
            },
            rpcUrls: {
              default: {
                http: ['https://rpc.sepolia.mantle.xyz'],
              },
              public: {
                http: ['https://rpc.sepolia.mantle.xyz'],
              },
            },
            blockExplorers: {
              default: {
                name: 'Mantle Sepolia Explorer',
                url: 'https://sepolia.mantlescan.xyz',
              },
            },
            testnet: true,
          },
        ],
      }}
    >
      {children}
    </PrivyProvider>
  );
}