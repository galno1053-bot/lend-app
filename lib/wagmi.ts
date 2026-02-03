import { createConfig, http } from "wagmi";
import { injected } from "wagmi/connectors/injected";
import { base, baseSepolia } from "viem/chains";
import { CHAINS } from "./config";

const baseRpc =
  process.env.NEXT_PUBLIC_BASE_RPC_URL ?? "https://mainnet.base.org";
const baseSepoliaRpc =
  process.env.NEXT_PUBLIC_BASE_SEPOLIA_RPC_URL ?? "https://sepolia.base.org";

export const wagmiConfig = createConfig({
  chains: CHAINS,
  transports: {
    [base.id]: http(baseRpc),
    [baseSepolia.id]: http(baseSepoliaRpc)
  },
  connectors: [injected()],
  ssr: true
});
