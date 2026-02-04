"use client";

import { useAccount, useConnect, useDisconnect, useSwitchChain, useChainId } from "wagmi";
import { injected } from "wagmi/connectors";
import { TARGET_CHAIN_ID } from "../lib/config";
import { useI18n } from "./LanguageProvider";

export default function WalletConnectButton() {
  const { address, isConnected } = useAccount();
  const { connect, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChain } = useSwitchChain();
  const chainId = useChainId();
  const { t } = useI18n();

  if (!isConnected) {
    return (
      <button
        className="rounded-full bg-emerald-500 text-white px-5 py-2 text-sm font-semibold"
        onClick={() => connect({ connector: injected() })}
        disabled={isPending}
      >
        {isPending ? t("wallet_connecting") : t("wallet_connect")}
      </button>
    );
  }

  const wrongChain = chainId !== TARGET_CHAIN_ID;

  return (
    <div className="flex items-center gap-3">
      <div className="text-xs text-slate-500">
        {address?.slice(0, 6)}...{address?.slice(-4)}
      </div>
      {wrongChain ? (
        <button
          className="rounded-full bg-amber-400 text-slate-900 px-4 py-2 text-xs font-semibold"
          onClick={() => switchChain({ chainId: TARGET_CHAIN_ID })}
        >
          {t("wallet_switch")}
        </button>
      ) : (
        <button
          className="rounded-full border border-slate-200 px-4 py-2 text-xs text-slate-600 hover:bg-slate-100"
          onClick={() => disconnect()}
        >
          {t("wallet_disconnect")}
        </button>
      )}
    </div>
  );
}
