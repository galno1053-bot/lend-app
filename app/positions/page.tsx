"use client";

import PositionsList from "../../components/PositionsList";
import { useAccount, useReadContract, useReadContracts } from "wagmi";
import { hybridLoanManagerAbi } from "@pinjaman/shared";
import { CONTRACT_ADDRESS } from "../../lib/config";

export default function PositionsPage() {
  const { address, isConnected } = useAccount();

  const { data } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: hybridLoanManagerAbi,
    functionName: "getUserPositions",
    args: [address ?? "0x0000000000000000000000000000000000000000"],
    query: { enabled: Boolean(address) }
  });

  const ids = Array.isArray(data) ? (data as readonly bigint[]) : [];

  const positionCalls =
    ids.map((id) => ({
      address: CONTRACT_ADDRESS,
      abi: hybridLoanManagerAbi,
      functionName: "positions" as const,
      args: [id] as const
    })) ?? [];

  const positions = useReadContracts({
    contracts: positionCalls,
    query: { enabled: positionCalls.length > 0 }
  });

  const items =
    ids.flatMap((id, index) => {
      const position = positions.data?.[index]?.result as any;
      if (!position) return [];
      return [
        {
          id,
          status: position[7] ?? 0,
          principalIdr: position[4] ?? 0n,
          tokenLabel: position[2] === "0x0000000000000000000000000000000000000000" ? "ETH" : "USDC"
        }
      ];
    }) ?? [];

  return (
    <section>
      <h1 className="font-display text-2xl mb-4">My Loan</h1>
      {!isConnected ? (
        <div className="text-slate-500">Connect wallet untuk melihat posisi.</div>
      ) : (
        <PositionsList items={items} />
      )}
    </section>
  );
}
