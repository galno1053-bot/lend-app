"use client";

import clsx from "clsx";

type Token = "ETH" | "USDC";

type Pool = {
  token: Token;
  title: string;
  subtitle: string;
  description: string;
  aprBadge: string;
};

const POOLS: Pool[] = [
  {
    token: "ETH",
    title: "ETH \u2192 IDR",
    subtitle: "ETH collateral",
    description: "LTV max 70% - Liquidation 95% - Simple interest",
    aprBadge: "APR 5% fixed"
  },
  {
    token: "USDC",
    title: "USDC \u2192 IDR",
    subtitle: "USDC collateral",
    description: "LTV max 70% - Liquidation 95% - Simple interest",
    aprBadge: "APR 5% fixed"
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
              <div className="flex flex-col items-end gap-2">
                <div className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                  {pool.aprBadge}
                </div>
                <div
                  className={clsx(
                    "h-8 w-8 rounded-full border grid place-items-center",
                    active
                      ? "bg-emerald-500 text-white border-emerald-500"
                      : "bg-white text-slate-500 border-slate-200"
                  )}
                  aria-hidden="true"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M5 12h14M13 6l6 6-6 6"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-3">{pool.description}</p>
          </button>
        );
      })}
    </div>
  );
}
