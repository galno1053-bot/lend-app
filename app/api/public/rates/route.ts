import { NextResponse } from "next/server";
import { createPublicClient, http } from "viem";
import { base, baseSepolia } from "viem/chains";
import { hybridLoanManagerAbi } from "@pinjaman/shared";

const chainId = Number(process.env.NEXT_PUBLIC_CHAIN_ID ?? baseSepolia.id);
const rpcUrl =
  process.env.NEXT_PUBLIC_BASE_RPC_URL ??
  (chainId === base.id ? "https://mainnet.base.org" : "https://sepolia.base.org");
const contractAddress = (process.env.NEXT_PUBLIC_CONTRACT_ADDRESS ??
  "0x0000000000000000000000000000000000000000") as `0x${string}`;

export async function GET() {
  try {
    const client = createPublicClient({
      chain: chainId === base.id ? base : baseSepolia,
      transport: http(rpcUrl)
    });

    const [ethUsd, usdIdrRate, usdIdrUpdatedAt, isStale] = await Promise.all([
      client.readContract({
        address: contractAddress,
        abi: hybridLoanManagerAbi,
        functionName: "getEthUsd"
      }),
      client.readContract({
        address: contractAddress,
        abi: hybridLoanManagerAbi,
        functionName: "usdIdrRate"
      }),
      client.readContract({
        address: contractAddress,
        abi: hybridLoanManagerAbi,
        functionName: "usdIdrUpdatedAt"
      }),
      client.readContract({
        address: contractAddress,
        abi: hybridLoanManagerAbi,
        functionName: "isFxRateStale"
      })
    ]);

    return NextResponse.json({
      ethUsd,
      usdIdrRate,
      usdIdrUpdatedAt,
      isStale
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
