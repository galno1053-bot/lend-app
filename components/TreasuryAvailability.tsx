"use client";

import { formatIdr } from "@pinjaman/shared";
import { TREASURY_IDR_AVAILABLE } from "../lib/config";
import { useI18n } from "./LanguageProvider";

export default function TreasuryAvailability() {
  const { t } = useI18n();
  const available = Number.isFinite(TREASURY_IDR_AVAILABLE) ? TREASURY_IDR_AVAILABLE : 0;
  const isAvailable = available > 0;

  return (
    <div className="glass-card p-5 space-y-3">
      <div className="flex items-center justify-between">
        <div className="text-sm font-semibold text-slate-800">{t("availability_title")}</div>
        <div
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            isAvailable
              ? "bg-emerald-100 text-emerald-700"
              : "bg-slate-100 text-slate-500"
          }`}
        >
          {isAvailable ? t("availability_available") : t("availability_unavailable")}
        </div>
      </div>
      <div className="text-xs text-slate-500">{t("availability_subtitle")}</div>
      <div className="space-y-1">
        <div className="text-xs text-slate-500">{t("availability_amount")}</div>
        <div className="text-xl font-semibold">{formatIdr(available)} IDR</div>
      </div>
    </div>
  );
}
