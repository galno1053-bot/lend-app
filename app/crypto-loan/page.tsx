"use client";

import { useI18n } from "../../components/LanguageProvider";

export default function CryptoLoanPage() {
  const { t } = useI18n();

  return (
    <section className="max-w-4xl space-y-4">
      <h1 className="font-display text-2xl">{t("crypto_loan_title")}</h1>
      <div className="glass-card p-6 text-sm text-slate-500">{t("crypto_loan_coming")}</div>
    </section>
  );
}
