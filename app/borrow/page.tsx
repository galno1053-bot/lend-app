"use client";

import { useRouter } from "next/navigation";
import LoanPools from "../../components/LoanPools";

export default function BorrowPage() {
  const router = useRouter();

  return (
    <section className="max-w-5xl space-y-6">
      <div className="space-y-2">
        <h1 className="font-display text-2xl">IDR Loan</h1>
        <p className="text-sm text-slate-500">Choose a collateral pool to apply for a loan.</p>
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
