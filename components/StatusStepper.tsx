"use client";

import { statusToLabel } from "../lib/utils";

const STEPS = ["PAYOUT_PENDING", "ACTIVE", "REPAY_REQUESTED", "CLOSED"];

export default function StatusStepper({ status }: { status: number }) {
  const label = statusToLabel(status);

  if (label === "LIQUIDATED") {
    return (
      <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
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
              isActive ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-500"
            }`}
          >
            {step.replace("_", " ")}
          </div>
        );
      })}
    </div>
  );
}
