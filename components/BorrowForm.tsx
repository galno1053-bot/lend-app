"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  useAccount,
  useBalance,
  useChainId,
  usePublicClient,
  useReadContract,
  useSignMessage,
  useWriteContract
} from "wagmi";
import { erc20Abi, parseEventLogs, parseUnits, zeroAddress } from "viem";
import { v4 as uuidv4 } from "uuid";
import { useRouter } from "next/navigation";
import { buildBankDetailsMessage, computeOffchainRefHash, formatIdr, parseIdrToBigInt } from "@pinjaman/shared";
import { CONTRACT_ADDRESS, TARGET_CHAIN_ID, USDC_ADDRESS, USDC_DECIMALS } from "../lib/config";
import { hybridLoanManagerAbi } from "@pinjaman/shared";
import { usePrices } from "../hooks/usePrices";

const schema = z.object({
  token: z.enum(["ETH", "USDC"]),
  collateralAmount: z.string().min(1, "Collateral wajib diisi"),
  requestedIdr: z.string().min(1, "Jumlah IDR wajib diisi"),
  recipientName: z.string().min(2, "Nama penerima wajib diisi"),
  bankName: z.string().min(2, "Nama bank wajib diisi"),
  accountNumber: z.string().min(5, "Nomor rekening wajib diisi"),
  acknowledgePayout: z.boolean().refine((val) => val, "Wajib disetujui"),
  acknowledgeRisk: z.boolean().refine((val) => val, "Wajib disetujui")
});

type FormValues = z.infer<typeof schema>;

const BANKS = [
  "BCA",
  "BRI",
  "BNI",
  "Mandiri",
  "CIMB Niaga",
  "Permata",
  "Danamon",
  "BSI",
  "OCBC NISP",
  "BTN"
];

export default function BorrowForm() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const router = useRouter();
  const publicClient = usePublicClient();
  const { signMessageAsync } = useSignMessage();
  const { writeContractAsync } = useWriteContract();
  const { ethUsd, usdIdrRate, isFxStale } = usePrices();

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      token: "ETH",
      collateralAmount: "",
      requestedIdr: "",
      recipientName: "",
      bankName: BANKS[0],
      accountNumber: "",
      acknowledgePayout: false,
      acknowledgeRisk: false
    }
  });

  const token = form.watch("token");
  const collateralAmount = form.watch("collateralAmount");
  const requestedIdr = form.watch("requestedIdr");

  const collateralAmountBn = useMemo(() => {
    try {
      if (!collateralAmount) return 0n;
      return parseUnits(collateralAmount, token === "ETH" ? 18 : USDC_DECIMALS);
    } catch {
      return 0n;
    }
  }, [collateralAmount, token]);

  const requestedIdrBn = useMemo(() => parseIdrToBigInt(requestedIdr), [requestedIdr]);

  const ethBalance = useBalance({ address });
  const usdcBalance = useBalance({ address, token: USDC_ADDRESS });

  const tokenAddress = token === "ETH" ? zeroAddress : USDC_ADDRESS;

  const collateralValueIdr = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: hybridLoanManagerAbi,
    functionName: "getCollateralValueIDRForToken",
    args: [collateralAmountBn, tokenAddress],
    query: { enabled: collateralAmountBn > 0n }
  });

  const maxBorrowIdr = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: hybridLoanManagerAbi,
    functionName: "getMaxBorrowIDR",
    args: [collateralAmountBn, tokenAddress],
    query: { enabled: collateralAmountBn > 0n }
  });

  const onSubmit = form.handleSubmit(async (values) => {
    setError(null);

    if (!isConnected || !address) {
      setError("Connect wallet terlebih dahulu.");
      return;
    }

    if (chainId !== TARGET_CHAIN_ID) {
      setError("Network salah. Silakan switch ke Base.");
      return;
    }

    if (!publicClient) {
      setError("Public client belum siap.");
      return;
    }

    if (isFxStale.data === true) {
      setError("FX rate stale. Coba lagi nanti.");
      return;
    }

    if (requestedIdrBn === 0n || collateralAmountBn === 0n) {
      setError("Jumlah collateral dan pinjaman wajib diisi.");
      return;
    }

    if (maxBorrowIdr.data && requestedIdrBn > maxBorrowIdr.data) {
      setError("Jumlah pinjaman melebihi max borrow (LTV 70%).");
      return;
    }

    if (values.token === "ETH" && ethBalance.data?.value) {
      if (collateralAmountBn > ethBalance.data.value) {
        setError("Saldo ETH tidak mencukupi.");
        return;
      }
    }

    if (values.token === "USDC" && usdcBalance.data?.value) {
      if (collateralAmountBn > usdcBalance.data.value) {
        setError("Saldo USDC tidak mencukupi.");
        return;
      }
    }

    setLoading(true);
    try {
      const draftId = uuidv4();
      const offchainRefHash = computeOffchainRefHash(draftId);
      const timestamp = new Date().toISOString();
      const message = buildBankDetailsMessage({
        address,
        token: values.token,
        collateralAmount: values.collateralAmount,
        requestedIdr: values.requestedIdr,
        draftId,
        timestamp,
        chainId: String(chainId)
      });

      const signature = await signMessageAsync({ message });

      const response = await fetch("/api/bank-details", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          draftId,
          offchainRefHash,
          address,
          token: values.token,
          collateralAmount: values.collateralAmount,
          requestedIdr: values.requestedIdr,
          timestamp,
          chainId,
          recipientName: values.recipientName,
          bankName: values.bankName,
          accountNumber: values.accountNumber,
          signature,
          message
        })
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error ?? "Gagal simpan bank details");
      }

      if (values.token === "ETH") {
        const hash = await writeContractAsync({
          address: CONTRACT_ADDRESS,
          abi: hybridLoanManagerAbi,
          functionName: "createRequestETH",
          args: [requestedIdrBn, offchainRefHash],
          value: collateralAmountBn
        });
        const receipt = await publicClient.waitForTransactionReceipt({ hash });
        const logs = parseEventLogs({
          abi: hybridLoanManagerAbi,
          logs: receipt.logs,
          eventName: "LoanRequested"
        });
        const positionId = logs[0]?.args?.positionId;
        router.push(`/positions/${positionId?.toString() ?? ""}`);
      } else {
        const allowance = await publicClient.readContract({
          address: USDC_ADDRESS,
          abi: erc20Abi,
          functionName: "allowance",
          args: [address, CONTRACT_ADDRESS]
        });
        if (allowance < collateralAmountBn) {
          await writeContractAsync({
            address: USDC_ADDRESS,
            abi: erc20Abi,
            functionName: "approve",
            args: [CONTRACT_ADDRESS, collateralAmountBn]
          });
        }
        const hash = await writeContractAsync({
          address: CONTRACT_ADDRESS,
          abi: hybridLoanManagerAbi,
          functionName: "createRequestUSDC",
          args: [collateralAmountBn, requestedIdrBn, offchainRefHash]
        });
        const receipt = await publicClient.waitForTransactionReceipt({ hash });
        const logs = parseEventLogs({
          abi: hybridLoanManagerAbi,
          logs: receipt.logs,
          eventName: "LoanRequested"
        });
        const positionId = logs[0]?.args?.positionId;
        router.push(`/positions/${positionId?.toString() ?? ""}`);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Terjadi kesalahan";
      setError(message);
    } finally {
      setLoading(false);
    }
  });

  return (
    <form onSubmit={onSubmit} className="glass-card p-8 space-y-6">
      <div className="space-y-2">
        <h2 className="font-display text-2xl">Ajukan Pinjaman</h2>
        <p className="text-sm text-slate-600">
          Collateral ke IDR manual. LTV max 70%, liquidasi jika LTV &gt;= 95%.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2">
          <span className="text-sm text-slate-600">Collateral</span>
          <select
            className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3 py-2"
            {...form.register("token")}
          >
            <option value="ETH">ETH</option>
            <option value="USDC">USDC</option>
          </select>
        </label>

        <label className="space-y-2">
          <span className="text-sm text-slate-600">Jumlah Collateral</span>
          <input
            className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3 py-2"
            placeholder={token === "ETH" ? "0.5" : "1000"}
            {...form.register("collateralAmount")}
          />
          <span className="text-xs text-slate-500">
            Balance:{" "}
            {token === "ETH"
              ? ethBalance.data?.formatted ?? "-"
              : usdcBalance.data?.formatted ?? "-"}{" "}
            {token}
          </span>
        </label>

        <label className="space-y-2 md:col-span-2">
          <span className="text-sm text-slate-600">Jumlah Pinjaman (IDR)</span>
          <input
            className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3 py-2"
            placeholder="10.000.000"
            {...form.register("requestedIdr")}
          />
          <span className="text-xs text-slate-500">
            Max borrow: {formatIdr(maxBorrowIdr.data ?? 0n)} IDR
          </span>
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="glass-card p-4">
          <div className="text-xs text-slate-500">ETH/USD</div>
          <div className="text-lg font-semibold">
            {ethUsd.data ? Number(ethUsd.data) / 1e8 : "-"}
          </div>
        </div>
        <div className="glass-card p-4">
          <div className="text-xs text-slate-500">USD/IDR</div>
          <div className="text-lg font-semibold">
            {usdIdrRate.data ? Number(usdIdrRate.data) / 1e8 : "-"}
          </div>
        </div>
        <div className="glass-card p-4">
          <div className="text-xs text-slate-500">Nilai Collateral</div>
          <div className="text-lg font-semibold">
            {formatIdr(collateralValueIdr.data ?? 0n)} IDR
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-display text-lg">Detail Rekening</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2">
            <span className="text-sm text-slate-600">Nama Penerima</span>
            <input
              className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3 py-2"
              {...form.register("recipientName")}
            />
          </label>
          <label className="space-y-2">
            <span className="text-sm text-slate-600">Bank</span>
            <select
              className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3 py-2"
              {...form.register("bankName")}
            >
              {BANKS.map((bank) => (
                <option key={bank} value={bank}>
                  {bank}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-2 md:col-span-2">
            <span className="text-sm text-slate-600">Nomor Rekening</span>
            <input
              className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3 py-2"
              {...form.register("accountNumber")}
            />
          </label>
        </div>
      </div>

      <div className="space-y-3">
        <label className="flex items-start gap-3 text-sm text-slate-600">
          <input type="checkbox" className="mt-1" {...form.register("acknowledgePayout")} />
          Saya paham pencairan IDR dilakukan manual oleh admin.
        </label>
        <label className="flex items-start gap-3 text-sm text-slate-600">
          <input type="checkbox" className="mt-1" {...form.register("acknowledgeRisk")} />
          Saya paham risiko liquidasi jika LTV mencapai 95%.
        </label>
      </div>

      {error && <div className="text-sm text-rose-600">{error}</div>}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-emerald-400 text-slate-900 py-3 font-semibold"
      >
        {loading ? "Memproses..." : "Ajukan Pinjaman"}
      </button>
    </form>
  );
}
