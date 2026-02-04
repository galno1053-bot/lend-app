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
      <div className="h-1" />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-4 lg:hidden">
          <TreasuryAvailability />
        </div>
        <BorrowForm selectedToken={token} allowedTokens={[token]} />
        <div className="space-y-4 lg:sticky lg:top-24 self-start hidden lg:block">
          <TreasuryAvailability />
        </div>
      </div>
    </section>
  );
}
