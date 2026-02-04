"use client";

import { StatusKey, statusToKey } from "../lib/utils";
import { useI18n } from "./LanguageProvider";
import { TranslationKey } from "../lib/i18n";

const STEPS: StatusKey[] = ["payout_pending", "active", "repay_requested", "closed"];

export default function StatusStepper({ status }: { status: number }) {
  const { t } = useI18n();
  const label = statusToKey(status);

  if (label === "liquidated") {
    return (
      <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
        {t("liquidated_notice")}
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
            {t(`status_${step}` as TranslationKey)}
          </div>
        );
      })}
    </div>
  );
}
