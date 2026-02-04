"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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
import { useI18n } from "./LanguageProvider";

type FormValues = {
  token: "ETH" | "USDC";
  collateralAmount: string;
  requestedIdr: string;
  recipientName: string;
  bankName: string;
  accountNumber: string;
  acknowledgeRisk: boolean;
};

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

type BorrowFormProps = {
  selectedToken?: "ETH" | "USDC";
  onTokenChange?: (token: "ETH" | "USDC") => void;
  lockToken?: boolean;
  allowedTokens?: Array<"ETH" | "USDC">;
};

export default function BorrowForm({
  selectedToken,
  onTokenChange,
  lockToken,
  allowedTokens
}: BorrowFormProps) {
  const { t, lang } = useI18n();
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const router = useRouter();
  const publicClient = usePublicClient();
  const { signMessageAsync } = useSignMessage();
  const { writeContractAsync } = useWriteContract();
  const { isFxStale } = usePrices();

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const schema = useMemo(
    () =>
      z.object({
        token: z.enum(["ETH", "USDC"]),
        collateralAmount: z.string().min(1, t("validation_collateral_required")),
        requestedIdr: z.string().min(1, t("validation_loan_required")),
        recipientName: z.string().min(2, t("validation_recipient_required")),
        bankName: z.string().min(2, t("validation_bank_required")),
        accountNumber: z.string().min(5, t("validation_account_required")),
        acknowledgeRisk: z.boolean().refine((val) => val, t("validation_required"))
      }),
    [lang, t]
  );

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      token: "ETH",
      collateralAmount: "",
      requestedIdr: "",
      recipientName: "",
      bankName: BANKS[0],
      accountNumber: "",
      acknowledgeRisk: false
    }
  });

  const tokenOptions = useMemo(() => {
    if (allowedTokens && allowedTokens.length > 0) return allowedTokens;
    return ["ETH", "USDC"] as Array<"ETH" | "USDC">;
  }, [allowedTokens]);

  const token = form.watch("token");
  const collateralAmount = form.watch("collateralAmount");
  const requestedIdr = form.watch("requestedIdr");

  const didInitToken = useRef(false);

  useEffect(() => {
    const preferredToken =
      selectedToken && tokenOptions.includes(selectedToken) ? selectedToken : tokenOptions[0];

    if (!preferredToken) return;

    if (lockToken) {
      if (preferredToken !== token) {
        form.setValue("token", preferredToken);
      }
      return;
    }

    if (!didInitToken.current) {
      if (preferredToken !== token) {
        form.setValue("token", preferredToken);
      }
      didInitToken.current = true;
    }
  }, [selectedToken, tokenOptions, token, lockToken, form]);

  useEffect(() => {
    if (tokenOptions.length === 0) return;
    if (!tokenOptions.includes(token)) {
      form.setValue("token", tokenOptions[0]);
    }
  }, [tokenOptions, token, form]);

  useEffect(() => {
    if (onTokenChange) {
      onTokenChange(token);
    }
  }, [token, onTokenChange]);

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

  const APR_BPS_UI = 500n; // 5% APR for UI indicator
  const interestAnnual = (requestedIdrBn * APR_BPS_UI) / 10000n;
  const debtEstimated = requestedIdrBn + interestAnnual;
  const collateralValue = collateralValueIdr.data ?? 0n;
  const ltvBps =
    collateralValue > 0n ? (debtEstimated * 10000n) / collateralValue : 0n;
  const ltvPct = Number(ltvBps) / 100;
  const ltvBarWidth = Math.min(100, Math.max(0, ltvPct));

  const onSubmit = form.handleSubmit(async (values) => {
    setError(null);

    if (!isConnected || !address) {
      setError(t("error_connect_wallet"));
      return;
    }

    if (chainId !== TARGET_CHAIN_ID) {
      setError(t("error_wrong_network"));
      return;
    }

    if (!publicClient) {
      setError(t("error_public_client"));
      return;
    }

    if (isFxStale.data === true) {
      setError(t("error_fx_stale"));
      return;
    }

    if (requestedIdrBn === 0n || collateralAmountBn === 0n) {
      setError(t("error_amounts_required"));
      return;
    }

    if (maxBorrowIdr.data && requestedIdrBn > maxBorrowIdr.data) {
      setError(t("error_exceeds_max"));
      return;
    }

    if (values.token === "ETH" && ethBalance.data?.value) {
      if (collateralAmountBn > ethBalance.data.value) {
        setError(t("error_insufficient_eth"));
        return;
      }
    }

    if (values.token === "USDC" && usdcBalance.data?.value) {
      if (collateralAmountBn > usdcBalance.data.value) {
        setError(t("error_insufficient_usdc"));
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
        throw new Error(data.error ?? t("error_save_bank"));
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
      const message = err instanceof Error ? err.message : t("error_generic");
      setError(message);
    } finally {
      setLoading(false);
    }
  });

  return (
    <form onSubmit={onSubmit} className="glass-card p-8 space-y-6">
      <div className="space-y-2">
        <h2 className="font-display text-2xl">{t("apply_title")}</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2">
          <span className="text-sm text-slate-600">{t("label_collateral")}</span>
          <select
            className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3 py-2 disabled:bg-slate-100 disabled:text-slate-400"
            {...form.register("token")}
            disabled={lockToken}
          >
            {tokenOptions.map((option) => (
              <option key={option} value={option}>
                {option} (Base)
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-2">
          <span className="text-sm text-slate-600">{t("label_collateral_amount")}</span>
          <input
            className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3 py-2"
            placeholder={token === "ETH" ? "0.5" : "1000"}
            {...form.register("collateralAmount")}
          />
          <span className="text-xs text-slate-500">
            {t("label_balance")}:{" "}
            {token === "ETH"
              ? ethBalance.data?.formatted ?? "-"
              : usdcBalance.data?.formatted ?? "-"}{" "}
            {token}
          </span>
        </label>

        <label className="space-y-2 md:col-span-2">
          <span className="text-sm text-slate-600">{t("label_loan_amount")}</span>
          <div className="relative">
            <input
              className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3 py-2 pr-16"
              placeholder="10.000.000"
              {...form.register("requestedIdr")}
            />
            <button
              type="button"
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-200"
              onClick={() => {
                const max = maxBorrowIdr.data ?? 0n;
                form.setValue("requestedIdr", formatIdr(max), { shouldDirty: true });
              }}
            >
              {t("button_max")}
            </button>
          </div>
          <span className="text-xs text-slate-500">
            {t("label_max_borrow")}: {formatIdr(maxBorrowIdr.data ?? 0n)} IDR
          </span>
        </label>
      </div>

      <div className="glass-card p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="text-sm text-slate-600">{t("label_ltv")}</div>
          <div className="flex items-center gap-2">
            <div className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
              {t("apr_badge")}
            </div>
            <div
              className={`rounded-full px-3 py-1 text-xs ${
                ltvPct >= 90
                  ? "bg-rose-100 text-rose-600"
                  : ltvPct >= 80
                    ? "bg-orange-100 text-orange-700"
                    : ltvPct >= 70
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-emerald-100 text-emerald-600"
              }`}
            >
              {Number.isFinite(ltvPct) ? `${ltvPct.toFixed(2)}%` : "-"}
            </div>
          </div>
        </div>

        <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
          <div
            className={`h-full ${
              ltvPct >= 90
                ? "bg-rose-500"
                : ltvPct >= 80
                  ? "bg-orange-500"
                  : ltvPct >= 70
                    ? "bg-yellow-500"
                    : "bg-emerald-500"
            }`}
            style={{ width: `${ltvBarWidth}%` }}
          />
        </div>

        <div className="grid gap-3 md:grid-cols-3 text-sm">
          <div>
            <div className="text-xs text-slate-500">{t("label_collateral_value")}</div>
            <div className="font-semibold">{formatIdr(collateralValue)} IDR</div>
          </div>
          <div>
            <div className="text-xs text-slate-500">{t("label_loan")}</div>
            <div className="font-semibold">{formatIdr(requestedIdrBn)} IDR</div>
          </div>
          <div>
            <div className="text-xs text-slate-500">{t("label_estimated_debt")}</div>
            <div className="font-semibold">{formatIdr(debtEstimated)} IDR</div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-display text-lg">{t("section_bank_details")}</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2">
            <span className="text-sm text-slate-600">{t("label_recipient_name")}</span>
            <input
              className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3 py-2"
              {...form.register("recipientName")}
            />
          </label>
          <label className="space-y-2">
            <span className="text-sm text-slate-600">{t("label_bank")}</span>
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
            <span className="text-sm text-slate-600">{t("label_account_number")}</span>
            <input
              className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3 py-2"
              {...form.register("accountNumber")}
            />
          </label>
        </div>
      </div>

      <div className="space-y-3">
        <label className="flex items-start gap-3 text-sm text-slate-600">
          <input type="checkbox" className="mt-1" {...form.register("acknowledgeRisk")} />
          {t("acknowledge_liquidation")}
        </label>
      </div>

      {error && <div className="text-sm text-rose-600">{error}</div>}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-emerald-400 text-slate-900 py-3 font-semibold"
      >
        {loading ? t("button_processing") : t("button_submit")}
      </button>
    </form>
  );
}
