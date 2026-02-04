"use client";

import clsx from "clsx";

type Token = "ETH" | "USDC";

type Pool = {
  token: Token;
  title: string;
  subtitle: string;
  description: string;
};

const POOLS: Pool[] = [
  {
    token: "ETH",
    title: "ETH → IDR",
    subtitle: "Collateral ETH",
    description: "LTV max 70% • Liquidasi 95% • APR simple interest"
  },
  {
    token: "USDC",
    title: "USDC → IDR",
    subtitle: "Collateral USDC",
    description: "LTV max 70% • Liquidasi 95% • APR simple interest"
  }
];

export default function LoanPools({
  selected = null,
  onSelect
}: {
  selected?: Token | null;
  onSelect?: (token: Token) => void;
}) {
  return (
    <div className="grid gap-4">
      {POOLS.map((pool) => {
        const active = selected === pool.token;
        return (
          <button
            key={pool.token}
            type="button"
            onClick={() => onSelect?.(pool.token)}
            className={clsx(
              "glass-card p-5 text-left transition border",
              active ? "border-emerald-400 bg-emerald-50" : "border-slate-200 hover:bg-slate-50"
            )}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-lg font-semibold text-slate-900">{pool.title}</div>
                <div className="text-xs text-slate-500 mt-1">{pool.subtitle}</div>
              </div>
              <div
                className={clsx(
                  "rounded-full px-3 py-1 text-xs",
                  active ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-600"
                )}
              >
                {active ? "Selected" : "Open"}
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-3">{pool.description}</p>
          </button>
        );
      })}
    </div>
  );
}
