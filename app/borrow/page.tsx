"use client";

import { useRouter } from "next/navigation";
import LoanPools from "../../components/LoanPools";
import { useI18n } from "../../components/LanguageProvider";

export default function BorrowPage() {
  const router = useRouter();
  const { t } = useI18n();

  return (
    <section className="max-w-5xl space-y-6">
      <div className="space-y-2">
        <h1 className="font-display text-2xl">{t("idr_loan_title")}</h1>
        <p className="text-sm text-slate-500">{t("choose_pool")}</p>
      </div>

      <LoanPools
        onSelect={(token) => {
          const path = token === "ETH" ? "/borrow/eth" : "/borrow/usdc";
          router.push(path);
        }}
      />
    </section>
  );
}
