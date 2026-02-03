"use client";

import { useState } from "react";
import { useAccount, usePublicClient, useReadContract, useWriteContract } from "wagmi";
import { formatUnits, zeroAddress } from "viem";
import { formatIdr } from "@pinjaman/shared";
import { hybridLoanManagerAbi } from "@pinjaman/shared";
import { CONTRACT_ADDRESS, USDC_DECIMALS } from "../lib/config";
import { buildRepayRef, statusToLabel } from "../lib/utils";
import StatusStepper from "./StatusStepper";

export default function PositionDetail({ positionId }: { positionId: bigint }) {
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const { writeContractAsync } = useWriteContract();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const position = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: hybridLoanManagerAbi,
    functionName: "positions",
    args: [positionId]
  });

  const debt = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: hybridLoanManagerAbi,
    functionName: "getDebtNow",
    args: [positionId]
  });

  const collateralValue = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: hybridLoanManagerAbi,
    functionName: "getCollateralValueIDR",
    args: [positionId]
  });

  const ltv = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: hybridLoanManagerAbi,
    functionName: "getLtvNow",
    args: [positionId]
  });

  const data = position.data;
  const status = Number(data?.[7] ?? 0);
  const token = data?.[2] as `0x${string}` | undefined;
  const collateralAmount = data?.[3] as bigint | undefined;

  const tokenLabel = token === zeroAddress ? "ETH" : "USDC";
  const formattedCollateral =
    token === zeroAddress
      ? collateralAmount
        ? Number(formatUnits(collateralAmount, 18)).toFixed(4)
        : "-"
      : collateralAmount
        ? Number(formatUnits(collateralAmount, USDC_DECIMALS)).toFixed(2)
        : "-";

  const handleRequestRepay = async () => {
    if (!publicClient) return;
    setError(null);
    setLoading(true);
    try {
      const repayRefHash = buildRepayRef(positionId);
      const hash = await writeContractAsync({
        address: CONTRACT_ADDRESS,
        abi: hybridLoanManagerAbi,
        functionName: "requestRepay",
        args: [positionId, repayRefHash]
      });
      await publicClient.waitForTransactionReceipt({ hash });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal request repay");
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async () => {
    if (!publicClient) return;
    setError(null);
    setLoading(true);
    try {
      const hash = await writeContractAsync({
        address: CONTRACT_ADDRESS,
        abi: hybridLoanManagerAbi,
        functionName: "withdrawCollateral",
        args: [positionId]
      });
      await publicClient.waitForTransactionReceipt({ hash });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal withdraw");
    } finally {
      setLoading(false);
    }
  };

  if (!data) {
    return <div className="text-sm text-white/60">Memuat posisi...</div>;
  }

  if (address && data?.[1]?.toLowerCase() !== address.toLowerCase()) {
    return <div className="text-sm text-rose-200">Posisi ini bukan milik wallet kamu.</div>;
  }

  return (
    <div className="space-y-6">
      <StatusStepper status={status} />

      <div className="grid gap-4 md:grid-cols-2">
        <div className="glass-card p-4">
          <div className="text-xs text-white/60">Principal</div>
          <div className="text-lg font-semibold">{formatIdr(data[4] as bigint)} IDR</div>
        </div>
        <div className="glass-card p-4">
          <div className="text-xs text-white/60">Debt Now</div>
          <div className="text-lg font-semibold">{formatIdr(debt.data ?? 0n)} IDR</div>
        </div>
        <div className="glass-card p-4">
          <div className="text-xs text-white/60">Collateral</div>
          <div className="text-lg font-semibold">
            {formattedCollateral} {tokenLabel}
          </div>
        </div>
        <div className="glass-card p-4">
          <div className="text-xs text-white/60">Collateral Value</div>
          <div className="text-lg font-semibold">{formatIdr(collateralValue.data ?? 0n)} IDR</div>
        </div>
        <div className="glass-card p-4">
          <div className="text-xs text-white/60">LTV Now</div>
          <div className="text-lg font-semibold">
            {ltv.data ? `${(Number(ltv.data) / 100).toFixed(2)}%` : "-"}
          </div>
        </div>
        <div className="glass-card p-4">
          <div className="text-xs text-white/60">Status</div>
          <div className="text-lg font-semibold">{statusToLabel(status)}</div>
        </div>
      </div>

      {error && <div className="text-sm text-rose-300">{error}</div>}

      <div className="flex flex-wrap gap-3">
        {status === 1 && (
          <button
            onClick={handleRequestRepay}
            disabled={loading}
            className="rounded-xl bg-amber-300 text-slate-900 px-4 py-2 text-sm font-semibold"
          >
            Saya sudah transfer pelunasan
          </button>
        )}
        {status === 3 && (
          <button
            onClick={handleWithdraw}
            disabled={loading}
            className="rounded-xl bg-emerald-400 text-slate-900 px-4 py-2 text-sm font-semibold"
          >
            Ambil jaminan
          </button>
        )}
      </div>
    </div>
  );
}
