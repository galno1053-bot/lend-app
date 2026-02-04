"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import WalletConnectButton from "./WalletConnectButton";

const NAV_ITEMS = [
  { label: "Rupiah Loan", href: "/borrow" },
  { label: "My Loan", href: "/positions" }
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="flex min-h-screen">
        <aside className="hidden md:flex w-64 flex-col border-r border-slate-200 bg-white px-6 py-6">
          <div className="flex items-center gap-2 text-xl font-display">
            <div className="h-8 w-8 rounded-full bg-emerald-500 text-white grid place-items-center text-sm">
              P
            </div>
            Pinjaman
          </div>
          <nav className="mt-10 space-y-2">
            {NAV_ITEMS.map((item) => {
              const active = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={clsx(
                    "flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition",
                    active
                      ? "bg-emerald-50 text-emerald-700 font-semibold"
                      : "text-slate-600 hover:bg-slate-100"
                  )}
                >
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="mt-auto text-xs text-slate-400">
            Hybrid IDR Loans on Base
          </div>
        </aside>

        <div className="flex-1 flex flex-col">
          <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/80 backdrop-blur">
            <div className="flex items-center justify-between px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="md:hidden flex items-center gap-2 text-lg font-display">
                  <div className="h-8 w-8 rounded-full bg-emerald-500 text-white grid place-items-center text-sm">
                    P
                  </div>
                  Pinjaman
                </div>
                <div className="hidden md:block text-sm text-slate-500"></div>
              </div>
              <WalletConnectButton />
            </div>
            <div className="md:hidden flex gap-2 px-6 pb-4">
              {NAV_ITEMS.map((item) => {
                const active = pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={clsx(
                      "rounded-full px-4 py-2 text-xs transition",
                      active
                        ? "bg-emerald-500 text-white"
                        : "bg-slate-100 text-slate-600"
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </header>

          <main className="flex-1 px-6 py-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
