"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { useState } from "react";
import WalletConnectButton from "./WalletConnectButton";
import { useI18n } from "./LanguageProvider";
import { TranslationKey } from "../lib/i18n";

const NAV_ITEMS: Array<{ labelKey: TranslationKey; href: string }> = [
  { labelKey: "nav_idr_loan", href: "/borrow" },
  { labelKey: "nav_crypto_loan", href: "/crypto-loan" },
  { labelKey: "nav_my_loans", href: "/positions" }
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { lang, setLang, t } = useI18n();

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="flex min-h-screen">
        <aside className="hidden md:flex w-64 flex-col border-r border-slate-200 bg-white px-6 py-6 sticky top-0 h-screen">
          <div className="flex items-center gap-2 text-xl font-display">
            <div className="h-8 w-8 rounded-full bg-emerald-500 text-white grid place-items-center text-sm">
              N
            </div>
            Naxa
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
                  {t(item.labelKey)}
                </Link>
              );
            })}
          </nav>
          <div className="mt-auto text-xs text-slate-400">Naxa Finance • Base</div>
        </aside>

        <div className="flex-1 flex flex-col">
          <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur relative">
            <div className="flex items-center justify-between px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="md:hidden flex items-center gap-2 text-lg font-display">
                  <div className="h-8 w-8 rounded-full bg-emerald-500 text-white grid place-items-center text-sm">
                    N
                  </div>
                  Naxa
                </div>
                <div className="hidden md:block text-sm text-slate-500"></div>
              </div>
              <div className="hidden md:flex items-center gap-3">
                <div className="inline-flex rounded-full border border-slate-200 bg-white p-0.5 text-xs">
                  <button
                    type="button"
                    onClick={() => setLang("en")}
                    className={clsx(
                      "rounded-full px-2 py-1 font-semibold",
                      lang === "en" ? "bg-emerald-500 text-white" : "text-slate-500"
                    )}
                  >
                    EN
                  </button>
                  <button
                    type="button"
                    onClick={() => setLang("id")}
                    className={clsx(
                      "rounded-full px-2 py-1 font-semibold",
                      lang === "id" ? "bg-emerald-500 text-white" : "text-slate-500"
                    )}
                  >
                    ID
                  </button>
                </div>
                <WalletConnectButton />
              </div>
              <button
                className="md:hidden rounded-full border border-slate-200 px-3 py-2 text-slate-600 hover:bg-slate-100"
                onClick={() => setMobileOpen((open) => !open)}
                aria-label="Toggle menu"
              >
                <div className="flex flex-col gap-1">
                  <span className="h-0.5 w-5 bg-slate-600" />
                  <span className="h-0.5 w-5 bg-slate-600" />
                </div>
              </button>
            </div>
            <div
              className={clsx(
                "md:hidden absolute left-0 right-0 top-full bg-white border-b border-slate-200 shadow-sm transition-all duration-300 overflow-hidden",
                mobileOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
              )}
            >
              <div className="px-6 py-4 space-y-3">
                {NAV_ITEMS.map((item) => {
                  const active = pathname.startsWith(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={clsx(
                        "flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition",
                        active
                          ? "bg-emerald-50 text-emerald-700 font-semibold"
                          : "text-slate-600 hover:bg-slate-100"
                      )}
                    >
                      <span className="h-2 w-2 rounded-full bg-emerald-500" />
                      {t(item.labelKey)}
                    </Link>
                  );
                })}
                <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
                  <div className="inline-flex rounded-full border border-slate-200 bg-white p-0.5 text-xs">
                    <button
                      type="button"
                      onClick={() => setLang("en")}
                      className={clsx(
                        "rounded-full px-2 py-1 font-semibold",
                        lang === "en" ? "bg-emerald-500 text-white" : "text-slate-500"
                      )}
                    >
                      EN
                    </button>
                    <button
                      type="button"
                      onClick={() => setLang("id")}
                      className={clsx(
                        "rounded-full px-2 py-1 font-semibold",
                        lang === "id" ? "bg-emerald-500 text-white" : "text-slate-500"
                      )}
                    >
                      ID
                    </button>
                  </div>
                  <WalletConnectButton />
                </div>
              </div>
            </div>
          </header>

          <main className="flex-1 px-6 py-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
