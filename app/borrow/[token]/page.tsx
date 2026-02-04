import Link from "next/link";
import { redirect } from "next/navigation";
import BorrowForm from "../../../components/BorrowForm";

const TOKEN_MAP: Record<string, "ETH" | "USDC"> = {
  eth: "ETH",
  usdc: "USDC"
};

export default function BorrowTokenPage({ params }: { params: { token: string } }) {
  const key = params.token?.toLowerCase();
  const token = key ? TOKEN_MAP[key] : undefined;

  if (!token) {
    redirect("/borrow");
  }

  return (
    <section className="max-w-5xl space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/borrow"
          className="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-600 hover:bg-slate-100"
        >
          ← Back
        </Link>
        <div className="text-xl font-display">Ajukan Pinjaman</div>
      </div>

      <div className="glass-card p-5">
        <div className="text-xs text-slate-500">Pool dipilih</div>
        <div className="text-lg font-semibold mt-1">{token} → IDR</div>
        <div className="text-xs text-slate-500 mt-2">
          LTV max 70% • Liquidasi 95% • APR simple interest
        </div>
      </div>

      <BorrowForm selectedToken={token} lockToken />
    </section>
  );
}
