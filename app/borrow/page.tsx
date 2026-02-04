"use client";

import { useState } from "react";
import BorrowForm from "../../components/BorrowForm";
import LoanPools from "../../components/LoanPools";

export default function BorrowPage() {
  const [selectedToken, setSelectedToken] = useState<"ETH" | "USDC" | null>(null);

  return (
    <section className="max-w-5xl space-y-6">
      <div className="space-y-2">
        <h1 className="font-display text-2xl">Rupiah Loan</h1>
        <p className="text-sm text-slate-500">Pilih pool collateral untuk ajukan pinjaman.</p>
      </div>

      <LoanPools selected={selectedToken} onSelect={setSelectedToken} />

      {selectedToken ? (
        <BorrowForm selectedToken={selectedToken} onTokenChange={setSelectedToken} />
      ) : (
        <div className="glass-card p-6 text-sm text-slate-500">
          Pilih salah satu pool di atas untuk menampilkan form pengajuan pinjaman.
        </div>
      )}
    </section>
  );
}
