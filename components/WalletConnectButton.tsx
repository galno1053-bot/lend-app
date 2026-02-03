"use client";

import { useAccount, useConnect, useDisconnect, useSwitchChain, useChainId } from "wagmi";
import { injected } from "wagmi/connectors/injected";
import { TARGET_CHAIN_ID } from "../lib/config";

export default function WalletConnectButton() {
  const { address, isConnected } = useAccount();
  const { connect, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChain } = useSwitchChain();
  const chainId = useChainId();

  if (!isConnected) {
    return (
      <button
        className="rounded-full bg-emerald-400 text-slate-900 px-5 py-2 text-sm font-semibold"
        onClick={() => connect({ connector: injected() })}
        disabled={isPending}
      >
        {isPending ? "Connecting..." : "Connect Wallet"}
      </button>
    );
  }

  const wrongChain = chainId !== TARGET_CHAIN_ID;

  return (
    <div className="flex items-center gap-3">
      <div className="text-xs text-white/70">
        {address?.slice(0, 6)}...{address?.slice(-4)}
      </div>
      {wrongChain ? (
        <button
          className="rounded-full bg-amber-400 text-slate-900 px-4 py-2 text-xs font-semibold"
          onClick={() => switchChain({ chainId: TARGET_CHAIN_ID })}
        >
          Switch Network
        </button>
      ) : (
        <button
          className="rounded-full border border-white/20 px-4 py-2 text-xs text-white/80"
          onClick={() => disconnect()}
        >
          Disconnect
        </button>
      )}
    </div>
  );
}
