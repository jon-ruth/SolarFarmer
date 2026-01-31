import { http, createConfig } from "wagmi";
import { base, baseSepolia } from "wagmi/chains";
import { coinbaseWallet } from "wagmi/connectors";

// Use Base Sepolia for development, Base for production
const isDev = process.env.NODE_ENV === "development";

export const config = createConfig({
  chains: [isDev ? baseSepolia : base],
  connectors: [
    coinbaseWallet({
      appName: "SunCity",
      preference: "smartWalletOnly",
    }),
  ],
  transports: {
    [base.id]: http(),
    [baseSepolia.id]: http(),
  },
  ssr: true,
});

// Contract addresses (to be updated after deployment)
export const CONTRACTS = {
  SOLAR_TOKEN: {
    [base.id]: "0x0000000000000000000000000000000000000000" as `0x${string}`,
    [baseSepolia.id]: "0x0000000000000000000000000000000000000000" as `0x${string}`,
  },
} as const;

// Get contract address for current chain
export function getContractAddress(
  contract: keyof typeof CONTRACTS,
  chainId: number
): `0x${string}` {
  const addresses = CONTRACTS[contract];
  return addresses[chainId as keyof typeof addresses] || addresses[base.id];
}
