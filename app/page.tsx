import Link from "next/link";
import WalletConnectButton from "../components/WalletConnectButton";

export default function HomePage() {
  return (
    <main className="min-h-screen px-6 py-10">
      <header className="flex items-center justify-between">
        <div className="text-lg font-display">Pinjaman Hybrid</div>
        <WalletConnectButton />
      </header>

      <section className="mt-16 grid gap-10 md:grid-cols-2 items-center">
        <div className="space-y-6">
          <h1 className="font-display text-4xl leading-tight">
            Pinjaman IDR instan dengan jaminan crypto.
          </h1>
          <p className="text-white/70 text-lg">
            MVP hybrid: pencairan & pelunasan IDR manual. Transparan, onchain, dan tanpa
            akun.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              href="/borrow"
              className="rounded-full bg-emerald-400 text-slate-900 px-6 py-3 text-sm font-semibold"
            >
              Ajukan Pinjaman
            </Link>
            <Link
              href="/positions"
              className="rounded-full border border-white/20 px-6 py-3 text-sm text-white/80"
            >
              Lihat Posisi
            </Link>
          </div>
        </div>
        <div className="glass-card p-8 space-y-4">
          <div className="text-xs text-white/60">Pair tersedia</div>
          <div className="text-2xl font-semibold">ETH → IDR & USDC → IDR</div>
          <div className="text-sm text-white/60">
            LTV max 70%, threshold liquidasi 95%, bunga harian berbasis APR.
          </div>
        </div>
      </section>
    </main>
  );
}
