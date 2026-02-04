"use client";

import Link from "next/link";
import { formatIdr } from "@pinjaman/shared";
import { statusToKey } from "../lib/utils";
import { useI18n } from "./LanguageProvider";
import { TranslationKey } from "../lib/i18n";

type PositionItem = {
  id: bigint;
  status: number;
  principalIdr: bigint;
  tokenLabel: string;
};

export default function PositionsList({ items }: { items: PositionItem[] }) {
  const { t } = useI18n();

  if (!items.length) {
    return <div className="text-sm text-slate-500">{t("no_positions")}</div>;
  }

  return (
    <div className="grid gap-4">
      {items.map((item) => (
        <Link
          key={item.id.toString()}
          href={`/positions/${item.id.toString()}`}
          className="glass-card p-4 flex items-center justify-between hover:border-emerald-400/40 transition"
        >
          <div>
            <div className="text-sm text-slate-500">
              {t("label_position")} #{item.id.toString()}
            </div>
            <div className="font-semibold text-lg">{formatIdr(item.principalIdr)} IDR</div>
          </div>
          <div className="text-right">
            <div className="text-xs text-slate-500">{item.tokenLabel}</div>
            <div className="text-sm">
              {t(`status_${statusToKey(item.status)}` as TranslationKey)}
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
