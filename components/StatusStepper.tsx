"use client";

import { statusToLabel } from "../lib/utils";

const STEPS = ["PAYOUT_PENDING", "ACTIVE", "REPAY_REQUESTED", "CLOSED"];

export default function StatusStepper({ status }: { status: number }) {
  const label = statusToLabel(status);

  if (label === "LIQUIDATED") {
    return (
      <div className="rounded-xl border border-rose-400/40 bg-rose-500/10 p-4 text-sm text-rose-100">
        Posisi telah dilikuidasi.
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {STEPS.map((step, index) => {
        const isActive = index <= status;
        return (
          <div
            key={step}
            className={`rounded-full px-4 py-1 text-xs ${
              isActive ? "bg-emerald-400 text-slate-900" : "bg-white/10 text-white/60"
            }`}
          >
            {step.replace("_", " ")}
          </div>
        );
      })}
    </div>
  );
}
