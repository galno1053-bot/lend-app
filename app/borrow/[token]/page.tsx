"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import BorrowForm from "../../../components/BorrowForm";
import { useI18n } from "../../../components/LanguageProvider";
import TreasuryAvailability from "../../../components/TreasuryAvailability";

const TOKEN_MAP: Record<string, "ETH" | "USDC"> = {
  eth: "ETH",
  usdc: "USDC"
};

export default function BorrowTokenPage() {
  const router = useRouter();
  const { t } = useI18n();
  const params = useParams();
  const tokenParam = Array.isArray(params?.token) ? params.token[0] : params?.token;
  const key = tokenParam?.toLowerCase();
  const token = key ? TOKEN_MAP[key] : undefined;

  useEffect(() => {
    if (!token) {
      router.replace("/borrow");
    }
  }, [token, router]);

  if (!token) {
    return null;
  }

  return (
    <section className="max-w-6xl space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/borrow"
          className="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-600 hover:bg-slate-100"
        >
          &larr; {t("back")}
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <BorrowForm selectedToken={token} allowedTokens={[token]} />
        <div className="space-y-4 lg:sticky lg:top-24 self-start">
          <TreasuryAvailability />
        </div>
      </div>
    </section>
  );
}
